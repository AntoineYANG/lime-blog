"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import type { FC } from "react";

import { withSession } from "./with-session";
import ArticleProgress from "./article-progress.client";


const Separator: FC = () => <span aria-hidden="true" role="separator" className="select-none inline-block mx-1">|</span>;

const Navbar: FC = () => {
  const { data: session } = useSession();
  return (
    <div className="fixed top-0 left-0 right-0 z-30 text-sm h-10 flex flex-col">
      <header className="bg-lime-100 flex-1 text-gray-800 w-full flex items-center px-4 py-1">
        <div className="flex-none">
          <Link href="/">
            home
          </Link>
          <Separator />
          <Link href="/posts">
            posts
          </Link>
          <Separator />
          <Link href="/new">
            new
          </Link>
        </div>
        <div className="flex-1"></div>
        <div className="flex-none">
          {session?.user && (
            <div>
              <span>{session.user.email}</span>
              <Separator />
              <button className="cursor-pointer" onClick={() => signOut()}>sign out</button>
            </div>
          )}
          {!(session?.user) && (
            <Link href="/signin">sign in</Link>
          )}
        </div>
      </header>
      <ArticleProgress />
    </div>
  );
};


export default withSession(Navbar);
