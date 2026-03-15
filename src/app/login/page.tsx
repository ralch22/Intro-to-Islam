import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#E81C74] rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            ii
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Introduction to Islam</h1>
          <p className="text-gray-500 mt-2 text-sm">Student Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to your account</h2>
          <p className="text-sm text-gray-500 mb-8">
            Use your existing{" "}
            <a
              href="https://introtoislam.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1E40AF] hover:underline"
            >
              introtoislam.org
            </a>{" "}
            account — no new account needed.
          </p>

          {/* Sign in form */}
          <form
            action={async () => {
              "use server";
              await signIn("wordpress");
            }}
          >
            <button
              type="submit"
              className="w-full bg-[#E81C74] hover:bg-pink-600 text-white font-semibold py-4 px-6 rounded-full transition-colors shadow-md flex items-center justify-center gap-3 text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Sign in with IntroToIslam
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400">
              Single sign-on connects securely to your introtoislam.org account.
              <br />
              Your data is never shared with third parties.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Don&apos;t have an account?{" "}
          <a
            href="https://introtoislam.org/register"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1E40AF] hover:underline"
          >
            Register at introtoislam.org
          </a>
        </p>
      </div>
    </main>
  );
}
