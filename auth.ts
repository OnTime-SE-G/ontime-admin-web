import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Operator ID", type: "text" },
        password: { label: "Passcode", type: "password" },
      },
      async authorize(credentials) {
        const issuer = process.env.AUTH_KEYCLOAK_ISSUER!;
        const res = await fetch(`${issuer}/protocol/openid-connect/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.AUTH_KEYCLOAK_ID!,
            client_secret: process.env.AUTH_KEYCLOAK_SECRET!,
            grant_type: "password",
            username: credentials.username as string,
            password: credentials.password as string,
          }),
        });
        if (!res.ok) return null;
        const tokens = await res.json();
        const payload = JSON.parse(
          Buffer.from(tokens.access_token.split(".")[1], "base64url").toString()
        );
        return {
          id: payload.sub,
          name: payload.preferred_username ?? payload.name ?? credentials.username,
          email: payload.email ?? null,
          accessToken: tokens.access_token,
          roles: payload.realm_access?.roles ?? [],
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.roles = (user as { roles?: string[] }).roles;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.roles = (token.roles as string[]) ?? [];
      return session;
    },
  },
  pages: { signIn: "/" },
});
