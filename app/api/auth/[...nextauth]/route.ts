import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from 'bcrypt';
// import GithubProvider from "next-auth/providers/github";

import type { IUser } from "@models/user";


export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
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
        const res = await fetch(`${process.env.DEPLOY_HOST.replace(/\/$/, '')}/api/login`, {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" }
        });
        const user = await res.json() as IResult<IUser>;
        // If no error and we have user data, return it
        if (res.ok) {
          if (user.success) {
            return { id: user.data.id, email: user.data.email, name: user.data.email };
          }
          throw new Error("Authorization failed: " + user.reason);
        }
        // Return null if user data could not be retrieved
        return null;
        // return new Promise<User>(async (resolve, reject) => {
        //   try {
        //     // const prepared = await db.prepare('SELECT * FROM users WHERE email = $1');
        //     // // prepared.bindVarchar(1, credentials.email);
        //     // // const reader = await prepared.runAndReadAll();
        //     // // const rows = reader.getRows();
        //     // // console.log({rows});
        //     // const data: User = {
        //     //   id: '',
        //     //   email: '',
        //     // };
        //     // // if (chunk) {
        //     // //   chunk.getColumns()
        //     // // } else {
        //     // //   // FIXME: ...
        //     // // }
        //     // resolve(data);
        //   } catch (error) {
        //     reject(error);
        //   }
        // });
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
};

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
