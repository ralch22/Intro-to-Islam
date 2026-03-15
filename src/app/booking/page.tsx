import { CalEmbed } from "@/components/booking/CalEmbed";

const INSTRUCTORS = [
  {
    id: "1",
    name: "Sheikh Ahmed Al-Rashid",
    calLink: "introtoislam/sheikh-ahmed",
    specialisation: "Islamic Theology & Fiqh",
    languages: ["English", "Arabic"],
    bio: "Over 15 years of experience teaching Islamic sciences. Specialises in Aqeedah, Fiqh, and Quranic studies.",
    available: true,
    initials: "SA",
  },
  {
    id: "2",
    name: "Ustadha Fatima Hassan",
    calLink: "introtoislam/ustadha-fatima",
    specialisation: "Quran & Women's Issues in Islam",
    languages: ["English", "Somali"],
    bio: "Certified Quran teacher with ijaza. Specialises in supporting sisters with questions about Islam and daily practice.",
    available: true,
    initials: "FH",
  },
  {
    id: "3",
    name: "Br. Yusuf Khalil",
    calLink: "introtoislam/yusuf-khalil",
    specialisation: "New Muslims & Comparative Religion",
    languages: ["English"],
    bio: "Dedicated to supporting those new to Islam. Former Christian with a background in comparative religious studies.",
    available: false,
    initials: "YK",
  },
];

export default function BookingPage() {
  return (
    <main>
      {/* Hero */}
      <header className="gradient-brand text-white py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white rounded-full" />
          <div className="absolute -left-20 bottom-0 w-64 h-64 bg-[#E81C74] rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Book a 1:1 Consultation
          </h1>
          <p className="text-base md:text-xl text-blue-100 max-w-2xl mx-auto">
            Schedule a private session with one of our qualified instructors. All sessions are free and conducted via video call.
          </p>
        </div>
      </header>

      {/* Instructors grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {INSTRUCTORS.map((instructor) => (
            <div
              key={instructor.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col"
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E81C74] to-[#1E40AF] flex items-center justify-center text-white font-bold text-xl shrink-0">
                  {instructor.initials}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg leading-tight">{instructor.name}</h2>
                  <p className="text-sm text-[#E81C74] font-medium">{instructor.specialisation}</p>
                </div>
              </div>

              {/* Languages */}
              <div className="flex flex-wrap gap-2 mb-4">
                {instructor.languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-block bg-blue-50 text-[#1E40AF] text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    {lang}
                  </span>
                ))}
              </div>

              {/* Bio */}
              <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">{instructor.bio}</p>

              {/* Availability + CTA */}
              <div className="mt-auto">
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      instructor.available ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  <span className="text-sm text-gray-500">
                    {instructor.available ? "Available for bookings" : "Currently unavailable"}
                  </span>
                </div>

                {instructor.available ? (
                  <CalEmbed calLink={instructor.calLink} />
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-400 py-3 px-6 rounded-full font-bold cursor-not-allowed"
                  >
                    Unavailable
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info section */}
        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-6 md:p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">How It Works</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Choose an instructor, pick a time that suits you, and receive a video call link by email. All consultations are completely free.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
            {[
              { step: "1", title: "Choose an Instructor", desc: "Select the instructor whose expertise matches your questions." },
              { step: "2", title: "Pick a Time", desc: "Browse available slots and book directly in your timezone." },
              { step: "3", title: "Join the Call", desc: "Receive a confirmation email with your video call link." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-[#E81C74] text-white font-bold flex items-center justify-center text-sm shrink-0">
                  {step}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
