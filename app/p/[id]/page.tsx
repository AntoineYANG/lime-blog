import Image from "next/image";
import type { Metadata } from "next";
import { type FC } from "react";
import * as runtime from "react/jsx-runtime";
import Link from "next/link";
import matter from "gray-matter";
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

const P = mdxComponents.p;

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
    <div className="text-center w-full pb-32">
      <div className="max-w-4xl mx-auto text-left">
        <section className="px-6 md:px-12 pb-10">
          <div className="relative w-full min-h-[20vh] max-h-60 md:max-h-80 overflow-hidden bg-gray-100 mb-10 md:mb-12">
            <Image
              src="/blog-cover.jpg"
              alt="cover"
              layout="fill"
              objectFit="cover"
              className="rounded-2xl"
            />
          </div>
          <h1 className={`${font.kleeOne.className} text-3xl leading-10 md:text-4xl md:leading-12 font-bold text-gray-900 tracking-widest text-center portrait:mt-4 my-6`}>
            {which.title}
          </h1>
          <div className="text-start space-x-2 my-4 flex flex-wrap">
            {tags.map((tag: string, i: number) => (
              <Link key={i} href={`/tag/${encodeURIComponent(tag)}`} className="px-2 py-0.5 mb-2 rounded-full bg-gray-50/50 hover:bg-gray-100/60 focus:bg-gray-100/60">
                <span key={i} className="text-sm leading-4 text-gray-600 whitespace-nowrap">
                  {tag}
                </span>
              </Link>
            ))}
          </div>
          <p className="text-gray-500 mt-2 text-sm text-end">
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
          <article className="mt-10 pb-8 text-gray-700 text-lg leading-8" id="main">
            <MDXContent components={mdxComponents} />
          </article>
        </section>
        {/* TODO: componentize */}
        {/* comments */}
        <section className="mt-12 text-left px-6 md:px-12">
          <h2 className="text-2xl font-bold mb-10 text-gray-800">🍋‍🟩 Comments</h2>
          {[{
            id: '1',
            author: {
              id: 'xxx',
              name: 'Robot A',
              avatar: "",
            },
            createdAt: (new Date("2025/03/08 23:50").valueOf() / 1_000),
            content: `This article truly resonated with me. The way you articulated your thoughts was both insightful and engaging. I especially appreciated the way you connected real-life experiences to your main argument. Keep up the great work—I’ll definitely be following your future posts!`,
          }, {
            id: '2',
            author: {
              id: 'xxy',
              name: 'Test data 1',
              avatar: "",
            },
            createdAt: (new Date("2025/03/08 23:54").valueOf() / 1_000),
            content: `What a well-written and thought-provoking piece! I found myself nodding along as I read through your analysis. Your perspective on this topic is refreshing, and it really gave me something to think about. Looking forward to reading more from you!`,
          }, {
            id: '3',
            author: {
              id: 'xxz',
              name: 'Tester',
              avatar: "",
            },
            createdAt: (new Date("2025/03/09 00:10").valueOf() / 1_000),
            content: `I love how you broke this topic down into digestible insights. Your writing style is both informative and captivating, making it a pleasure to read. I especially liked the conclusion—it left me with a sense of curiosity to explore the subject even further. Great job!`,
          }].map(comment => (
            <div key={comment.id} className="pt-2 pb-4">
              <div className="text-gray-600 flex items-center space-x-4">
                <Image
                  src={comment.author.avatar}
                  alt="avatar"
                  width={24}
                  height={24}
                  className="inline-block w-6 h-6 flex-none rounded-full border border-gray-300"
                />
                <div className="flex-none">
                  <Link href={`/author/${comment.author.id}`} className="cursor-pointer hover:underline focus:underline">
                    {comment.author.name}
                  </Link>
                </div>
                <div className="flex-none">
                  <span>
                    {new Date(comment.createdAt * 1_000).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="pl-10">
                <P>{comment.content}</P>  
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};


export default PostDetailPage;
