import { readFile, stat } from "fs/promises";
import fs, { exists } from "fs-extra";
import path from "path";
import type { Metadata } from "next";
import { type FC } from "react";
import * as runtime from "react/jsx-runtime";
import Link from "next/link";
import matter from "gray-matter";
import Balancer from "react-wrap-balancer";
import { compile, run } from "@mdx-js/mdx";

import postActions, { postDir } from "@lib/actions/posts";
import { font } from "@cp/theme";
import { mdxComponents } from "@cp/mdx";


fs.ensureDirSync(postDir);

export async function generateStaticParams() {
  try {
    const posts = await postActions.fetchAllPostId();
    if (!posts.success) {
      return [];
    }
    return posts.data.items.map(id => ({
      id: id,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const fn = path.join(postDir, `${id}.md`);
  if (!await exists(fn)) {
    return {};
  }
  const raw = await readFile(fn);
  const { data } = matter(raw);
  
  return {
    title: data.title,
  };
}

const PostDetailPage: FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params;
  const fn = path.join(postDir, `${id}.md`);
  if (!await exists(fn)) {
    return (
      <div>
        Not Found.
      </div>
    );
  }
  const raw = await readFile(fn);
  const { content, data } = matter(raw);
  const { title = "No Title", tags = [], date = (await stat(fn)).mtime, author = 'anonymous' } = data;
  
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
        <Balancer j={0.6}>{title}</Balancer>
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
        <Link href={`/author/${encodeURIComponent(author)}`} className="hover:underline focus:underline hover:text-gray-700 focus:text-gray-700">
          <span>
            {author}
          </span>
        </Link>
        &nbsp;-&nbsp;
        <span>
          {new Date(date).toLocaleDateString()}
        </span>
      </p>
      <MDXContent components={mdxComponents} />
    </article>
  );
};


export default PostDetailPage;
