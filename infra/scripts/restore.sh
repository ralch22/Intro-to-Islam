#!/usr/bin/env bash
# =============================================================================
# restore.sh — Restore from Backblaze B2 backup
# IntroToIslam — Hetzner CX32 VPS
# =============================================================================
#
# Restores:
#   1. PostgreSQL databases (Moodle + Cal.com)
#   2. MySQL databases (WordPress + Mautic)
#   3. Moodle data directory
#
# USAGE:
#   # Restore from latest backup (auto-detects most recent date folder)
#   ./restore.sh
#
#   # Restore from a specific date
#   ./restore.sh --date 2025-03-15
#
#   # Dry run — show what would be restored without making changes
#   ./restore.sh --dry-run
#
# WARNING: This script overwrites existing databases and files.
#          Stop application containers before running a full restore:
#            docker compose stop wordpress moodle calcom mautic
#          Then run this script, then start them again:
#            docker compose start wordpress moodle calcom mautic
#
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
COMPOSE_PROJECT_DIR="${COMPOSE_PROJECT_DIR:-/opt/iti/infra}"
ENV_FILE="${COMPOSE_PROJECT_DIR}/.env.hetzner"

if [[ -f "${ENV_FILE}" ]]; then
    set -a
    # shellcheck disable=SC1090
    source <(grep -v '^\s*#' "${ENV_FILE}" | grep -v '^\s*$')
    set +a
fi

RCLONE_REMOTE="${RCLONE_REMOTE:-b2}"
B2_BUCKET_NAME="${B2_BUCKET_NAME:-iti-backups}"
BACKUP_REMOTE="${RCLONE_REMOTE}:${B2_BUCKET_NAME}"

LOCAL_RESTORE_DIR="/tmp/iti-restore-$(date +%Y%m%d-%H%M%S)"

BACKUP_ENCRYPTION_PASSPHRASE="${BACKUP_ENCRYPTION_PASSPHRASE:-}"

POSTGRES_CONTAINER="iti-postgres"
MYSQL_CONTAINER="iti-mysql"
MOODLE_CONTAINER="iti-moodle"

MOODLE_DB_USER="${MOODLE_DB_USER:-moodle_user}"
MOODLE_DB_PASSWORD="${MOODLE_DB_PASSWORD:-}"
MOODLE_DB_NAME="${MOODLE_DB_NAME:-moodle}"
CALCOM_DB_USER="${CALCOM_DB_USER:-calcom_user}"
CALCOM_DB_PASSWORD="${CALCOM_DB_PASSWORD:-}"
CALCOM_DB_NAME="${CALCOM_DB_NAME:-calcom}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-}"
WORDPRESS_DB_NAME="${WORDPRESS_DB_NAME:-wordpress}"
MAUTIC_DB_NAME="${MAUTIC_DB_NAME:-mautic}"

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------
RESTORE_DATE=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --date)
            RESTORE_DATE="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--date YYYY-MM-DD] [--dry-run]"
            exit 1
            ;;
    esac
done

# ---------------------------------------------------------------------------
# Logging helpers
# ---------------------------------------------------------------------------
log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO]  $*"; }
warn() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN]  $*" >&2; }
fail() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $*" >&2; exit 1; }

dry_run_log() {
    if [[ "${DRY_RUN}" == "true" ]]; then
        echo "[DRY-RUN] $*"
    fi
}

# ---------------------------------------------------------------------------
# Cleanup on exit
# ---------------------------------------------------------------------------
cleanup() {
    if [[ -d "${LOCAL_RESTORE_DIR}" ]]; then
        log "Cleaning up local restore directory: ${LOCAL_RESTORE_DIR}"
        rm -rf "${LOCAL_RESTORE_DIR}"
    fi
}
trap cleanup EXIT

# ---------------------------------------------------------------------------
# Find the latest backup date folder on B2
# ---------------------------------------------------------------------------
find_latest_backup_date() {
    log "Listing available backup dates on B2..."
    # List top-level year/month/day folders; sort and take the last entry
    rclone lsf "${BACKUP_REMOTE}/" --dirs-only | \
        sort | \
        tail -1 | \
        tr -d '/'
}

# ---------------------------------------------------------------------------
# Download backup files for a given date
# ---------------------------------------------------------------------------
download_backups() {
    local date_path="$1"
    log "Downloading backups from: ${BACKUP_REMOTE}/${date_path}/"

    mkdir -p "${LOCAL_RESTORE_DIR}"

    if [[ "${DRY_RUN}" == "true" ]]; then
        dry_run_log "Would download from ${BACKUP_REMOTE}/${date_path}/ to ${LOCAL_RESTORE_DIR}/"
        rclone ls "${BACKUP_REMOTE}/${date_path}/"
        return
    fi

    rclone copy \
        "${BACKUP_REMOTE}/${date_path}/" \
        "${LOCAL_RESTORE_DIR}/" \
        --progress

    log "Downloaded files:"
    ls -lh "${LOCAL_RESTORE_DIR}/"
}

# ---------------------------------------------------------------------------
# Decrypt a .gpg file if needed
# ---------------------------------------------------------------------------
decrypt_file() {
    local file="$1"

    if [[ "${file}" == *.gpg ]]; then
        if [[ -z "${BACKUP_ENCRYPTION_PASSPHRASE}" ]]; then
            fail "File ${file} is encrypted but BACKUP_ENCRYPTION_PASSPHRASE is not set"
        fi

        local decrypted="${file%.gpg}"
        gpg --batch \
            --yes \
            --passphrase "${BACKUP_ENCRYPTION_PASSPHRASE}" \
            --output "${decrypted}" \
            --decrypt "${file}"

        rm -f "${file}"
        echo "${decrypted}"
    else
        echo "${file}"
    fi
}

# ---------------------------------------------------------------------------
# Find a backup file matching a pattern in the restore directory
# ---------------------------------------------------------------------------
find_backup_file() {
    local pattern="$1"
    local file
    file=$(find "${LOCAL_RESTORE_DIR}" -name "${pattern}" | head -1)
    if [[ -z "${file}" ]]; then
        warn "No backup file found matching: ${pattern}"
        echo ""
    else
        echo "${file}"
    fi
}

# ---------------------------------------------------------------------------
# 1. Restore PostgreSQL — Moodle
# ---------------------------------------------------------------------------
restore_postgres_moodle() {
    log "Restoring PostgreSQL Moodle database..."

    local archive_file
    archive_file=$(find_backup_file "postgres_moodle_*.sql.gz*")
    [[ -z "${archive_file}" ]] && { warn "Skipping Moodle DB restore — file not found"; return; }

    local sql_file
    sql_file=$(decrypt_file "${archive_file}")

    if [[ "${DRY_RUN}" == "true" ]]; then
        dry_run_log "Would drop and restore database ${MOODLE_DB_NAME} from ${sql_file}"
        return
    fi

    # Drop and recreate the database, then restore
    docker exec "${POSTGRES_CONTAINER}" \
        env PGPASSWORD="${MOODLE_DB_PASSWORD}" \
        psql --username="${MOODLE_DB_USER}" --dbname=postgres \
        -c "DROP DATABASE IF EXISTS ${MOODLE_DB_NAME};"

    docker exec "${POSTGRES_CONTAINER}" \
        env PGPASSWORD="${MOODLE_DB_PASSWORD}" \
        psql --username="${MOODLE_DB_USER}" --dbname=postgres \
        -c "CREATE DATABASE ${MOODLE_DB_NAME} OWNER ${MOODLE_DB_USER};"

    zcat "${sql_file}" | docker exec -i "${POSTGRES_CONTAINER}" \
        env PGPASSWORD="${MOODLE_DB_PASSWORD}" \
        psql --username="${MOODLE_DB_USER}" --dbname="${MOODLE_DB_NAME}"

    log "Moodle database restored successfully."
}

# ---------------------------------------------------------------------------
# 2. Restore PostgreSQL — Cal.com
# ---------------------------------------------------------------------------
restore_postgres_calcom() {
    log "Restoring PostgreSQL Cal.com database..."

    local archive_file
    archive_file=$(find_backup_file "postgres_calcom_*.sql.gz*")
    [[ -z "${archive_file}" ]] && { warn "Skipping Cal.com DB restore — file not found"; return; }

    local sql_file
    sql_file=$(decrypt_file "${archive_file}")

    if [[ "${DRY_RUN}" == "true" ]]; then
        dry_run_log "Would drop and restore database ${CALCOM_DB_NAME} from ${sql_file}"
        return
    fi

    docker exec "${POSTGRES_CONTAINER}" \
        env PGPASSWORD="${CALCOM_DB_PASSWORD}" \
        psql --username="${CALCOM_DB_USER}" --dbname=postgres \
        -c "DROP DATABASE IF EXISTS ${CALCOM_DB_NAME};"

    docker exec "${POSTGRES_CONTAINER}" \
        env PGPASSWORD="${CALCOM_DB_PASSWORD}" \
        psql --username="${CALCOM_DB_USER}" --dbname=postgres \
        -c "CREATE DATABASE ${CALCOM_DB_NAME} OWNER ${CALCOM_DB_USER};"

    zcat "${sql_file}" | docker exec -i "${POSTGRES_CONTAINER}" \
        env PGPASSWORD="${CALCOM_DB_PASSWORD}" \
        psql --username="${CALCOM_DB_USER}" --dbname="${CALCOM_DB_NAME}"

    log "Cal.com database restored successfully."
}

# ---------------------------------------------------------------------------
# 3. Restore MySQL — WordPress
# ---------------------------------------------------------------------------
restore_mysql_wordpress() {
    log "Restoring MySQL WordPress database..."

    local archive_file
    archive_file=$(find_backup_file "mysql_wordpress_*.sql.gz*")
    [[ -z "${archive_file}" ]] && { warn "Skipping WordPress DB restore — file not found"; return; }

    local sql_file
    sql_file=$(decrypt_file "${archive_file}")

    if [[ "${DRY_RUN}" == "true" ]]; then
        dry_run_log "Would drop and restore database ${WORDPRESS_DB_NAME} from ${sql_file}"
        return
    fi

    docker exec "${MYSQL_CONTAINER}" \
        mysql --user=root --password="${MYSQL_ROOT_PASSWORD}" \
        -e "DROP DATABASE IF EXISTS ${WORDPRESS_DB_NAME}; CREATE DATABASE ${WORDPRESS_DB_NAME};"

    zcat "${sql_file}" | docker exec -i "${MYSQL_CONTAINER}" \
        mysql --user=root --password="${MYSQL_ROOT_PASSWORD}" "${WORDPRESS_DB_NAME}"

    log "WordPress database restored successfully."
}

# ---------------------------------------------------------------------------
# 4. Restore MySQL — Mautic
# ---------------------------------------------------------------------------
restore_mysql_mautic() {
    log "Restoring MySQL Mautic database..."

    local archive_file
    archive_file=$(find_backup_file "mysql_mautic_*.sql.gz*")
    [[ -z "${archive_file}" ]] && { warn "Skipping Mautic DB restore — file not found"; return; }

    local sql_file
    sql_file=$(decrypt_file "${archive_file}")

    if [[ "${DRY_RUN}" == "true" ]]; then
        dry_run_log "Would drop and restore database ${MAUTIC_DB_NAME} from ${sql_file}"
        return
    fi

    docker exec "${MYSQL_CONTAINER}" \
        mysql --user=root --password="${MYSQL_ROOT_PASSWORD}" \
        -e "DROP DATABASE IF EXISTS ${MAUTIC_DB_NAME}; CREATE DATABASE ${MAUTIC_DB_NAME};"

    zcat "${sql_file}" | docker exec -i "${MYSQL_CONTAINER}" \
        mysql --user=root --password="${MYSQL_ROOT_PASSWORD}" "${MAUTIC_DB_NAME}"

    log "Mautic database restored successfully."
}

# ---------------------------------------------------------------------------
# 5. Restore Moodle data directory
# ---------------------------------------------------------------------------
restore_moodle_data() {
    log "Restoring Moodle data directory..."

    local archive_file
    archive_file=$(find_backup_file "moodle_data_*.tar.gz*")
    [[ -z "${archive_file}" ]] && { warn "Skipping Moodle data restore — file not found"; return; }

    local tar_file
    tar_file=$(decrypt_file "${archive_file}")

    if [[ "${DRY_RUN}" == "true" ]]; then
        dry_run_log "Would restore Moodle data from ${tar_file} into ${MOODLE_CONTAINER}:/bitnami/moodledata"
        return
    fi

    # Stream the tar archive into the Moodle container, overwriting existing data
    cat "${tar_file}" | docker exec -i "${MOODLE_CONTAINER}" \
        tar -xzf - -C /

    log "Moodle data directory restored successfully."
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
    log "========================================================"
    log "ITI Restore started"
    if [[ "${DRY_RUN}" == "true" ]]; then
        log "DRY RUN MODE — no changes will be made"
    fi
    log "========================================================"

    # Resolve backup date path on B2 (e.g. 2025/03/15)
    local date_path
    if [[ -n "${RESTORE_DATE}" ]]; then
        # Convert YYYY-MM-DD to YYYY/MM/DD for B2 path
        date_path=$(echo "${RESTORE_DATE}" | tr '-' '/')
        log "Using specified date: ${RESTORE_DATE} (path: ${date_path})"
    else
        log "No date specified — finding latest backup..."
        date_path=$(find_latest_backup_date)
        if [[ -z "${date_path}" ]]; then
            fail "No backups found on B2 remote: ${BACKUP_REMOTE}"
        fi
        log "Latest backup date: ${date_path}"
    fi

    download_backups "${date_path}"

    if [[ "${DRY_RUN}" == "true" ]]; then
        log "Dry run complete — exiting without making changes."
        exit 0
    fi

    log "WARNING: This will overwrite existing databases. You have 10 seconds to cancel (Ctrl+C)..."
    sleep 10

    restore_postgres_moodle
    restore_postgres_calcom
    restore_mysql_wordpress
    restore_mysql_mautic
    restore_moodle_data

    log "========================================================"
    log "ITI Restore COMPLETED SUCCESSFULLY"
    log "Next steps:"
    log "  1. Start application containers: docker compose start"
    log "  2. Run Moodle upgrade check: docker exec iti-moodle php admin/cli/upgrade.php"
    log "  3. Verify WordPress: https://introtoislam.org"
    log "========================================================"
}

main "$@"
