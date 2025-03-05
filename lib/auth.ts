import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
// import GithubProvider from "next-auth/providers/github";

import { db, sqlite } from "@/lib/drizzle";
import { LOCAL_LOGIN_ID } from "./constants";
import { BadUsrStatusErrorMessage, raiseErrorMessage, WrongUsrNameOrPwdErrorMessage } from "./errors";
import userActions from "./actions/users";


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
        await sqlite.users.init(db);
        const user = await db.query.users.findFirst({
          where: (u, op) => op.and(
            op.isNull(u.deleted_at),
            op.eq(u.email, credentials.email),
          ),
        });
        if (!user) {
          throw raiseErrorMessage(new WrongUsrNameOrPwdErrorMessage());
        }
        if (user.deleted_at) {
          throw raiseErrorMessage(new BadUsrStatusErrorMessage('User has been deleted.'));
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
    async session({ session: _session, token }) {
      const session = _session as AppSession;
      session.accessToken = token.accessToken;
      const username = session.user?.name;
      if (username) {
        try {
          const user = await userActions.getUser({ name: username });
          if (user.success) {
            session.appUser = user.data;
          }
        } catch (error) {
          console.error("Error occurred in session callback", error);
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};


export default authOptions;
