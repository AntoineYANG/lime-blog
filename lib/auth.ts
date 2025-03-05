import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
// import GithubProvider from "next-auth/providers/github";

import { db, sqlite } from "@lib/dizzle";
import { LOCAL_LOGIN_ID } from "./constants";
import { raiseErrorMessage, WrongUsrNameOrPwdErrorMessage } from "./errors";


const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      id: LOCAL_LOGIN_ID,
      name: "Credentials",
      credentials: {
        // username: { label: "Username", type: "text", placeholder: "username" },
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Authorization failed: invalid credential.");
        }
        await sqlite.users.init();
        const user = await db.query.users.findFirst({
          where: u => eq(u.email, credentials.email),
        });
        if (!user) {
          throw raiseErrorMessage(new WrongUsrNameOrPwdErrorMessage());
        }
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw raiseErrorMessage(new WrongUsrNameOrPwdErrorMessage());
        }
        return {
          id: user.id,
          name: user.username,
          email: user.email,
          image: user.avatar,
        };
      },
    }),
    // TODO: add more providers
    // GithubProvider({
    //   clientId: process.env.GITHUB_ID,
    //   clientSecret: process.env.GITHUB_SECRET,
    // }),
    // ...add more providers here
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token, user: _user }) {
      // @ts-expect-error appended entry
      session.accessToken = token.accessToken;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};


export default authOptions;
