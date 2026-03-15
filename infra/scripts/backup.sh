#!/usr/bin/env bash
# =============================================================================
# backup.sh — Daily backup to Backblaze B2
# IntroToIslam — Hetzner CX32 VPS
# =============================================================================
#
# Backs up:
#   1. PostgreSQL database (Moodle + Cal.com)
#   2. MySQL database (WordPress + Mautic)
#   3. Moodle data directory (uploaded files, course content)
#
# Uploads encrypted archives to Backblaze B2 via rclone.
# Removes remote backups older than 30 days.
#
# CRON SCHEDULE (add to root crontab with: crontab -e):
#   0 3 * * * /opt/iti/infra/scripts/backup.sh >> /var/log/iti-backup.log 2>&1
#
# PREREQUISITES:
#   - rclone configured with a B2 remote (run: rclone config)
#   - Docker installed and running
#   - .env.hetzner sourced or variables in environment
#   - gpg symmetric key set in BACKUP_ENCRYPTION_PASSPHRASE env var
#
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration — override via environment or .env.hetzner
# ---------------------------------------------------------------------------
COMPOSE_PROJECT_DIR="${COMPOSE_PROJECT_DIR:-/opt/iti/infra}"
ENV_FILE="${COMPOSE_PROJECT_DIR}/.env.hetzner"

# Load env vars from .env.hetzner if the file exists
if [[ -f "${ENV_FILE}" ]]; then
    # Export only non-comment, non-empty lines
    set -a
    # shellcheck disable=SC1090
    source <(grep -v '^\s*#' "${ENV_FILE}" | grep -v '^\s*$')
    set +a
fi

# Backup destination — Rclone remote:bucket/path
RCLONE_REMOTE="${RCLONE_REMOTE:-b2}"
B2_BUCKET_NAME="${B2_BUCKET_NAME:-iti-backups}"
BACKUP_REMOTE="${RCLONE_REMOTE}:${B2_BUCKET_NAME}"

# Local staging directory on the VPS (cleaned up after upload)
LOCAL_BACKUP_DIR="/tmp/iti-backup-$(date +%Y%m%d-%H%M%S)"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

# Retain backups on B2 for this many days
RETENTION_DAYS=30

# GPG passphrase for symmetric encryption (keep this secret)
BACKUP_ENCRYPTION_PASSPHRASE="${BACKUP_ENCRYPTION_PASSPHRASE:-}"

# Docker container names (must match docker-compose.yml)
POSTGRES_CONTAINER="iti-postgres"
MYSQL_CONTAINER="iti-mysql"
MOODLE_CONTAINER="iti-moodle"

# Database credentials (from .env.hetzner)
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
# Logging helpers
# ---------------------------------------------------------------------------
log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO]  $*"; }
warn() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN]  $*" >&2; }
fail() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# Cleanup on exit — always remove local staging dir
# ---------------------------------------------------------------------------
cleanup() {
    if [[ -d "${LOCAL_BACKUP_DIR}" ]]; then
        log "Cleaning up local staging directory: ${LOCAL_BACKUP_DIR}"
        rm -rf "${LOCAL_BACKUP_DIR}"
    fi
}
trap cleanup EXIT

# ---------------------------------------------------------------------------
# Dependency checks
# ---------------------------------------------------------------------------
check_dependencies() {
    local missing=()
    for cmd in docker rclone gpg tar gzip; do
        if ! command -v "${cmd}" &>/dev/null; then
            missing+=("${cmd}")
        fi
    done
    if [[ ${#missing[@]} -gt 0 ]]; then
        fail "Missing required commands: ${missing[*]}"
    fi

    # Check that target containers are running
    for container in "${POSTGRES_CONTAINER}" "${MYSQL_CONTAINER}"; do
        if ! docker inspect --format='{{.State.Running}}' "${container}" 2>/dev/null | grep -q "true"; then
            fail "Container ${container} is not running — aborting backup"
        fi
    done
}

# ---------------------------------------------------------------------------
# Encrypt a file with GPG symmetric encryption
# If BACKUP_ENCRYPTION_PASSPHRASE is unset, skip encryption with a warning.
# ---------------------------------------------------------------------------
encrypt_file() {
    local input_file="$1"
    local output_file="${input_file}.gpg"

    if [[ -z "${BACKUP_ENCRYPTION_PASSPHRASE}" ]]; then
        warn "BACKUP_ENCRYPTION_PASSPHRASE not set — skipping encryption (NOT recommended for production)"
        echo "${input_file}"
        return
    fi

    gpg --batch \
        --yes \
        --symmetric \
        --cipher-algo AES256 \
        --passphrase "${BACKUP_ENCRYPTION_PASSPHRASE}" \
        --output "${output_file}" \
        "${input_file}"

    rm -f "${input_file}"
    echo "${output_file}"
}

# ---------------------------------------------------------------------------
# 1. PostgreSQL backup — Moodle database
# ---------------------------------------------------------------------------
backup_postgres() {
    log "Starting PostgreSQL backup (Moodle)..."
    local dump_file="${LOCAL_BACKUP_DIR}/postgres_moodle_${TIMESTAMP}.sql.gz"

    docker exec "${POSTGRES_CONTAINER}" \
        env PGPASSWORD="${MOODLE_DB_PASSWORD}" \
        pg_dump \
            --username="${MOODLE_DB_USER}" \
            --dbname="${MOODLE_DB_NAME}" \
            --no-password \
            --format=plain \
            --no-acl \
            --no-owner \
        | gzip -9 > "${dump_file}"

    local final_file
    final_file=$(encrypt_file "${dump_file}")
    log "PostgreSQL Moodle dump: $(basename "${final_file}") ($(du -sh "${final_file}" | cut -f1))"
    echo "${final_file}"
}

# ---------------------------------------------------------------------------
# 2. PostgreSQL backup — Cal.com database
# ---------------------------------------------------------------------------
backup_postgres_calcom() {
    log "Starting PostgreSQL backup (Cal.com)..."
    local dump_file="${LOCAL_BACKUP_DIR}/postgres_calcom_${TIMESTAMP}.sql.gz"

    docker exec "${POSTGRES_CONTAINER}" \
        env PGPASSWORD="${CALCOM_DB_PASSWORD}" \
        pg_dump \
            --username="${CALCOM_DB_USER}" \
            --dbname="${CALCOM_DB_NAME}" \
            --no-password \
            --format=plain \
            --no-acl \
            --no-owner \
        | gzip -9 > "${dump_file}"

    local final_file
    final_file=$(encrypt_file "${dump_file}")
    log "PostgreSQL Cal.com dump: $(basename "${final_file}") ($(du -sh "${final_file}" | cut -f1))"
    echo "${final_file}"
}

# ---------------------------------------------------------------------------
# 3. MySQL backup — WordPress database
# ---------------------------------------------------------------------------
backup_mysql_wordpress() {
    log "Starting MySQL backup (WordPress)..."
    local dump_file="${LOCAL_BACKUP_DIR}/mysql_wordpress_${TIMESTAMP}.sql.gz"

    docker exec "${MYSQL_CONTAINER}" \
        mysqldump \
            --user=root \
            --password="${MYSQL_ROOT_PASSWORD}" \
            --single-transaction \
            --routines \
            --triggers \
            --add-drop-table \
            "${WORDPRESS_DB_NAME}" \
        | gzip -9 > "${dump_file}"

    local final_file
    final_file=$(encrypt_file "${dump_file}")
    log "MySQL WordPress dump: $(basename "${final_file}") ($(du -sh "${final_file}" | cut -f1))"
    echo "${final_file}"
}

# ---------------------------------------------------------------------------
# 4. MySQL backup — Mautic database
# ---------------------------------------------------------------------------
backup_mysql_mautic() {
    log "Starting MySQL backup (Mautic)..."
    local dump_file="${LOCAL_BACKUP_DIR}/mysql_mautic_${TIMESTAMP}.sql.gz"

    docker exec "${MYSQL_CONTAINER}" \
        mysqldump \
            --user=root \
            --password="${MYSQL_ROOT_PASSWORD}" \
            --single-transaction \
            --routines \
            --triggers \
            --add-drop-table \
            "${MAUTIC_DB_NAME}" \
        | gzip -9 > "${dump_file}"

    local final_file
    final_file=$(encrypt_file "${dump_file}")
    log "MySQL Mautic dump: $(basename "${final_file}") ($(du -sh "${final_file}" | cut -f1))"
    echo "${final_file}"
}

# ---------------------------------------------------------------------------
# 5. Moodle data directory backup (uploaded files, course content)
# ---------------------------------------------------------------------------
backup_moodle_data() {
    log "Starting Moodle data directory backup..."
    local archive_file="${LOCAL_BACKUP_DIR}/moodle_data_${TIMESTAMP}.tar.gz"

    # Stream the moodledata directory from the container to a local tar archive
    docker exec "${MOODLE_CONTAINER}" \
        tar -czf - /bitnami/moodledata \
        > "${archive_file}"

    local final_file
    final_file=$(encrypt_file "${archive_file}")
    log "Moodle data archive: $(basename "${final_file}") ($(du -sh "${final_file}" | cut -f1))"
    echo "${final_file}"
}

# ---------------------------------------------------------------------------
# 6. Upload to Backblaze B2
# ---------------------------------------------------------------------------
upload_to_b2() {
    log "Uploading backups to B2: ${BACKUP_REMOTE}/$(date +%Y/%m/%d)/"

    rclone copy \
        "${LOCAL_BACKUP_DIR}/" \
        "${BACKUP_REMOTE}/$(date +%Y/%m/%d)/" \
        --progress \
        --transfers 4 \
        --checkers 8 \
        --b2-hard-delete

    log "Upload complete."
}

# ---------------------------------------------------------------------------
# 7. Prune old backups (keep last RETENTION_DAYS days)
# ---------------------------------------------------------------------------
prune_old_backups() {
    log "Pruning backups older than ${RETENTION_DAYS} days from B2..."

    rclone delete \
        "${BACKUP_REMOTE}/" \
        --min-age "${RETENTION_DAYS}d" \
        --rmdirs \
        --b2-hard-delete

    log "Pruning complete."
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
    log "========================================================"
    log "ITI Backup started — ${TIMESTAMP}"
    log "========================================================"

    check_dependencies

    # Create local staging directory
    mkdir -p "${LOCAL_BACKUP_DIR}"

    # Run all backups (failures in individual steps are captured, not fatal)
    local failed=()

    backup_postgres        || failed+=("postgres-moodle")
    backup_postgres_calcom || failed+=("postgres-calcom")
    backup_mysql_wordpress || failed+=("mysql-wordpress")
    backup_mysql_mautic    || failed+=("mysql-mautic")
    backup_moodle_data     || failed+=("moodle-data")

    # Upload everything that was successfully created
    if [[ "$(ls -A "${LOCAL_BACKUP_DIR}")" ]]; then
        upload_to_b2 || failed+=("upload")
    else
        fail "No backup files were created — nothing to upload"
    fi

    prune_old_backups || warn "Pruning failed — old backups may accumulate"

    if [[ ${#failed[@]} -gt 0 ]]; then
        warn "Some backup steps failed: ${failed[*]}"
        log "========================================================"
        log "ITI Backup COMPLETED WITH ERRORS"
        log "========================================================"
        exit 1
    fi

    log "========================================================"
    log "ITI Backup COMPLETED SUCCESSFULLY"
    log "========================================================"
}

main "$@"
