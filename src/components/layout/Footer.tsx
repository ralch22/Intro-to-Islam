import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1F2937] text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E81C74] rounded-lg flex items-center justify-center text-white font-bold text-xl">
              ii
            </div>
            <span className="font-bold text-xl">Introduction to Islam</span>
          </Link>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm text-gray-400">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact Support</Link>
          </div>

          <div className="flex gap-4">
            {["facebook-f", "twitter", "youtube"].map((icon) => (
              <a
                key={icon}
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 text-gray-300 flex items-center justify-center hover:bg-[#E81C74] hover:text-white transition-all"
              >
                <span className="sr-only">{icon}</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          © All Rights Reserved 2026 | IntroToIslam.org
        </div>
      </div>
    </footer>
  );
}
