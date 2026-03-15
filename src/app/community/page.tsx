import Link from "next/link";

const posts = [
  {
    id: "p1",
    pinned: true,
    tag: "Pinned",
    tagStyle: "bg-blue-100 text-[#1E40AF]",
    title: "Welcome to the Foundation Course Community! 👋",
    body: "Assalamu alaikum everyone! Welcome to the official community space for the Foundation Course. This is your place to ask questions, share insights, and connect with fellow students. Please make sure to read our community guidelines before posting.",
    ago: "2 days ago",
    author: { name: "Ustadh Ahmed", role: "Instructor", initials: "UA", isInstructor: true },
    likes: 45,
    comments: 12,
    borderLeft: true,
  },
  {
    id: "p2",
    tag: "Module 1 Q&A",
    tagStyle: "bg-purple-100 text-[#6B21A8]",
    title: "Question about the concept of Tawheed",
    body: "I'm having a bit of trouble understanding the practical differences between the three categories of Tawheed mentioned in lesson 2. Could someone explain how they manifest in daily life with some practical examples?",
    ago: "4 hours ago",
    author: { name: "Omar S.", role: "Student", initials: null, isInstructor: false },
    likes: 8,
    comments: 3,
    reply: {
      author: "Ustadh Ahmed",
      initials: "UA",
      text: "Great question Omar. Think of it this way: Rububiyyah is acknowledging God as the creator/sustainer. Uluhiyyah is directing our actions (like prayer) only to Him. Asmaa wa Sifaat is knowing Him through His names...",
    },
  },
];

export default function CommunityPage() {
  return (
    <main className="flex-grow flex flex-col bg-gradient-to-b from-gray-50 to-[#F3F4F6]">
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 w-full">

        {/* Hero banner */}
        <div className="gradient-brand rounded-2xl p-6 md:p-10 text-white mb-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 hidden md:block text-9xl -mt-10 -mr-10">👥</div>
          <div className="relative z-10 max-w-3xl text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">Community Hub</h1>
            <p className="text-white/80 text-base md:text-lg mb-6">
              Connect, discuss, and learn together with fellow students and instructors.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="w-full sm:w-auto bg-white text-[#1E40AF] font-semibold py-3 px-8 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                ✏️ New Post
              </button>
              <button className="w-full sm:w-auto bg-white/20 text-white border border-white/30 font-medium py-3 px-8 rounded-full hover:bg-white/30 transition-colors">
                🔍 Search Discussions
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main feed */}
          <div className="flex-1 space-y-6 w-full overflow-hidden">

            {/* Filter tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <div className="flex gap-2 min-w-max px-2">
                  {["All Discussions", "Course Q&A", "Study Groups", "Announcements"].map((tab, i) => (
                    <button key={tab} className={`whitespace-nowrap px-5 py-2 rounded-lg font-medium text-sm transition-colors ${
                      i === 0 ? "bg-[#E81C74]/10 text-[#E81C74] font-semibold" : "text-gray-600 hover:bg-gray-50"
                    }`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto px-2 md:px-0">
                <span className="text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
                <select className="w-full md:w-auto bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#E81C74]">
                  <option>Recent Activity</option>
                  <option>Most Liked</option>
                  <option>Newest First</option>
                </select>
              </div>
            </div>

            {/* Compose */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-10 h-10 rounded-full bg-[#E81C74] text-white flex items-center justify-center font-bold shrink-0 hidden sm:flex">
                  A
                </div>
                <div className="flex-1 space-y-4">
                  <textarea
                    rows={2}
                    placeholder="Start a new discussion..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E81C74] focus:bg-white transition-all resize-none"
                  />
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-4">
                      {["🖼️", "🔗", "😊"].map((icon) => (
                        <button key={icon} className="p-2 text-gray-400 hover:text-[#E81C74] rounded-lg hover:bg-pink-50 transition-colors text-lg">
                          {icon}
                        </button>
                      ))}
                    </div>
                    <button className="w-full sm:w-auto bg-[#E81C74] text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-pink-700 transition-colors">
                      Post Discussion
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative ${post.borderLeft ? "border-l-4 border-l-[#1E40AF]" : ""}`}>
                  <div className={`p-5 ${post.borderLeft ? "pl-6" : ""}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 ${post.tagStyle}`}>
                        {post.pinned && "📌 "}
                        {post.tag}
                      </span>
                      <span className="text-xs text-gray-500">• {post.ago}</span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.body}</p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-100 pt-4 mt-2 gap-4">
                      <div className="flex items-center gap-3">
                        {post.author.initials ? (
                          <div className="w-8 h-8 rounded-full bg-[#1F2937] text-white flex items-center justify-center text-xs font-bold">
                            {post.author.initials}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold">
                            {post.author.name[0]}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-gray-900">{post.author.name}</div>
                          <div className={`text-xs font-medium ${post.author.isInstructor ? "text-[#E81C74]" : "text-gray-500"}`}>
                            {post.author.role}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button className="flex items-center gap-1.5 text-[#E81C74] text-sm font-medium">❤️ {post.likes}</button>
                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-[#1E40AF] text-sm font-medium">💬 {post.comments}</button>
                      </div>
                    </div>

                    {post.reply && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#1F2937] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {post.reply.initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-gray-900">{post.reply.author}</span>
                              <span className="text-[10px] bg-[#E81C74] text-white px-1.5 py-0.5 rounded">Instructor</span>
                            </div>
                            <p className="text-sm text-gray-600">{post.reply.text}</p>
                            <button className="text-xs font-medium text-[#1E40AF] mt-2 hover:underline">Read full reply</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="text-center pt-4 pb-8">
                <button className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors shadow-sm text-sm">
                  Load More Discussions
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">

            {/* Quick links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { href: "/courses/1", icon: "📖", label: "Course Details", bg: "bg-blue-50 text-[#1E40AF]" },
                  { href: "/courses/1/lesson/1-3", icon: "▶️", label: "Active Lesson", bg: "bg-purple-50 text-[#6B21A8]" },
                  { href: "#", icon: "👥", label: "Find Study Groups", bg: "bg-pink-50 text-[#E81C74]" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded ${link.bg} flex items-center justify-center`}>{link.icon}</div>
                      <span className="text-sm font-medium">{link.label}</span>
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-[#E81C74] transition-colors">›</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[#1E40AF]">🛡️</span>
                <h3 className="font-bold text-gray-900 text-sm">Community Guidelines</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                {[
                  "Be respectful and courteous",
                  "Keep discussions relevant to courses",
                  "No spam or self-promotion",
                  "Search before asking new questions",
                ].map((rule) => (
                  <li key={rule} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1 text-xs">✓</span> {rule}
                  </li>
                ))}
              </ul>
              <button className="text-xs font-medium text-[#1E40AF] hover:underline">Read full guidelines</button>
            </div>

            {/* Donation */}
            <div className="gradient-magenta rounded-xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-20 text-7xl">🤲</div>
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2">Support Our Program</h3>
                <p className="text-sm text-white/90 mb-5">
                  Help us keep these courses accessible to students worldwide by contributing to our crowdfunding campaign.
                </p>
                <button className="w-full bg-white text-[#E81C74] font-bold py-2.5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  Donate Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
