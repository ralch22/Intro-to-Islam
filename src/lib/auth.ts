import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: "wordpress",
      name: "IntroToIslam",
      type: "oauth",
      authorization: {
        url: `${process.env.WORDPRESS_SITE_URL ?? "https://introtoislam.org"}/oauth/authorize`,
        params: { scope: "openid email profile" },
      },
      token: `${process.env.WORDPRESS_SITE_URL ?? "https://introtoislam.org"}/oauth/token`,
      userinfo: `${process.env.WORDPRESS_SITE_URL ?? "https://introtoislam.org"}/oauth/me`,
      clientId: process.env.WORDPRESS_CLIENT_ID ?? "",
      clientSecret: process.env.WORDPRESS_CLIENT_SECRET ?? "",
      profile(profile: Record<string, unknown>) {
        return {
          id: String(profile.ID ?? profile.id ?? ""),
          name: String(profile.display_name ?? profile.name ?? ""),
          email: String(profile.user_email ?? profile.email ?? ""),
          image: String(profile.avatar_url ?? profile.picture ?? ""),
        };
      },
    },
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      (session as unknown as Record<string, unknown>).accessToken = token.accessToken;
      return session;
    },
  },
});
