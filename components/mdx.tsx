import type { FC, PropsWithChildren } from "react";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import type { MDXComponents } from "mdx/types";

import { font } from "@cp/theme";


const LinkSelf: FC<PropsWithChildren> = ({ children }) => {
  if (typeof children === "string") {
    const slug = children.replaceAll(/\s+/g, "-");
    return (
      <Link className="relative" href={`#${slug}`}>
        <div id={slug} className="pointer-events-none absolute w-px h-px left-1/2 top-0 -translate-y-[calc(2.5rem)]" />
        {children}
      </Link>
    );
  }
  return children;
};

export const mdxComponents = {
  h1: () => null,
  h2: ({ children }) => <h2 className={`${font.kleeOne.className} border-b border-dotted border-gray-400 text-2xl leading-9 md:text-3xl md:leading-10 font-bold text-gray-900 tracking-widest mt-16 mb-12`}><LinkSelf>{children}</LinkSelf></h2>,
  h3: ({ children }) => <h3 className={`${font.kleeOne.className} border-b border-dotted border-gray-400 text-[1.33rem] leading-8 md:text-2xl md:leading-9 font-bold text-gray-900 tracking-widest mt-12 mb-8`}><LinkSelf>{children}</LinkSelf></h3>,
  h4: ({ children }) => <h4 className={`${font.kleeOne.className} border-b border-dotted border-gray-400 text-xl leading-8 md:text-[1.33rem] md:leading-9 font-semibold text-gray-900 tracking-widest mt-10 mb-[calc(var(--spacing)*7.2)]`}><LinkSelf>{children}</LinkSelf></h4>,
  h5: ({ children }) => <h5 className={`${font.kleeOne.className} border-b border-dotted border-gray-400 text-[1.15rem] leading-7 md:text-xl md:leading-8 font-semibold text-gray-900 tracking-widest mt-9 mb-[calc(var(--spacing)*6.6)]`}><LinkSelf>{children}</LinkSelf></h5>,
  h6: ({ children }) => <h6 className={`${font.kleeOne.className} border-b border-dotted border-gray-400 text-[1.1rem] leading-7 md:text-[1.15rem] md:leading-8 font-semibold text-gray-900 mt-8 mb-6`}><LinkSelf>{children}</LinkSelf></h6>,
  hr: () => <hr className="border-gray-400 border-dashed my-20" />,
  p: ({ children }) => <p className="text-base text-gray-900 leading-7 my-5">{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className="bg-gray-500 border-l-4 border-red-400 pl-4 italic text-gray-600 mt-6">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => <ul className="list-disc pl-6 text-gray-900 my-4">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 text-gray-900 my-4">{children}</ol>,
  li: ({ children }) => <li className="mb-3">{children}</li>,
  code: ({ children }) => (
    <code className="text-sm">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto my-4">{children}</pre>
  ),
  table: ({ children }) => (
    <table className="table-auto w-full border-collapse border border-gray-300">{children}</table>
  ),
  th: ({ children }) => (
    <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-300 px-4 py-2">{children}</td>
  ),
  a: ({ children, href }) => {
    const isInnerHref = (() => {
      try {
        const _ = new URL(href.replace(/^[a-z]:\/\//, ''));
        return false;
      } catch {
        return true;
      }
    })();
    if (isInnerHref) {
      return (
        <Link
          target="_self"
          href={href}
          className="hover:underline text-blue-800"
        >
          {children}
        </Link>
      );
    }
    return (
      <Link
        href={href}
        target="_blank"
        className="hover:underline inline-flex items-center space-x-0.5 group text-blue-800"
      >
        <span className="flex-none">
          {children}
        </span>
        <ArrowTopRightOnSquareIcon aria-hidden="true" role="presentation" className="w-3 h-3 flex-none stroke-blue-700" />
      </Link>
    );
  },
} satisfies MDXComponents;
