import type { Metadata } from "next";
import { type FC } from "react";
import * as runtime from "react/jsx-runtime";
import Link from "next/link";
import matter from "gray-matter";
import Balancer from "react-wrap-balancer";
import { compile, run } from "@mdx-js/mdx";

import Post from "@actions/post";
import User from "@actions/user";
import { font } from "@cp/theme";
import { mdxComponents } from "@cp/mdx";


export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  // FIXME:
  const list = await Post.listPost.call();
  if (!list.success) {
    return {};
  }
  const which = list.data.items.find(w => w.id === id);
  if (!which) {
    return {};
  }
  const raw = which.preview;
  const { data } = matter(raw);
  
  return {
    title: data.title,
  };
}

const PostDetailPage: FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params;
  // FIXME:
  const list = await Post.listPost.call();
  if (!list.success) {
    return <>Not Found</>;
  }
  const which = list.data.items.find(w => w.id === id);
  if (!which) {
    return <>Not Found</>;
  }
  const a = await User.findUser.call({ id: which.authorId });
  const r = await fetch(new URL(which.url, process.env.DEPLOY_HOST));
  const raw = await r.text();
  const { content, data } = matter(raw);
  const { tags = [] } = data;
  
  const code = String(
    await compile(content, { outputFormat: 'function-body' })
  );
  const { default: MDXContent } = await run(code, {
    ...runtime,
    baseUrl: import.meta.url,
  });

  return (
    <article>
      <h1 className={`${font.kleeOne.className} text-4xl text-gray-950 xl:text-5xl leading-[1.5em] font-bold -mt-4 portrait:-mt-6 mb-10 portrait:mb-6 pb-6 border-b text-center`}>
        <Balancer j={0.6}>{which.title}</Balancer>
      </h1>
      <div className="text-start space-x-2 mb-2 flex flex-wrap">
        {tags.map((tag: string, i: number) => (
          <Link key={i} href={`/tag/${encodeURIComponent(tag)}`} className="px-2 py-0.5 mb-2 rounded-full bg-gray-50/50 hover:bg-gray-100/60 focus:bg-gray-100/60">
            <span key={i} className="text-sm leading-4 text-gray-800 whitespace-nowrap">
              {tag}
            </span>
          </Link>
        ))}
      </div>
      <p className="text-gray-400 text-end">
        {a.success && a.data?.name && (
          <Link href={`/author/${encodeURIComponent(a.data.name)}`} className="hover:underline focus:underline hover:text-gray-700 focus:text-gray-700">
            <span>
              {a.data.name}
            </span>
          </Link>
        )}
        &nbsp;-&nbsp;
        <span>
          {new Date(which.updatedAt * 1_000).toLocaleDateString()}{which.updatedAt !== which.createdAt ? ' (edited)' : ''}
        </span>
      </p>
      <MDXContent components={mdxComponents} />
    </article>
  );
};


export default PostDetailPage;
