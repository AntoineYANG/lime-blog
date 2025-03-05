import Link from "next/link";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import type { MDXComponents } from "mdx/types";

import { font } from "@cp/theme";


export const mdxComponents = {
  h1: () => null,
  h2: ({ children }) => <h2 className={`${font.kleeOne.className} text-3xl font-semibold text-foreground my-10`}>{children}</h2>,
  h3: ({ children }) => <h3 className={`${font.kleeOne.className} text-2xl font-medium text-gray-950 my-9`}>{children}</h3>,
  h4: ({ children }) => <h3 className={`${font.kleeOne.className} text-xl font-medium text-gray-950 my-8`}>{children}</h3>,
  h5: ({ children }) => <h3 className={`${font.kleeOne.className} text-lg font-medium text-gray-900 my-7`}>{children}</h3>,
  h6: ({ children }) => <h3 className={`${font.kleeOne.className} text-base font-medium text-gray-900 my-6`}>{children}</h3>,
  p: ({ children }) => <p className="text-base text-gray-800 leading-8 my-6">{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => <ul className="list-disc pl-6 text-gray-900 my-4">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 text-gray-900 my-4">{children}</ol>,
  li: ({ children }) => <li className="mb-3">{children}</li>,
  code: ({ children }) => (
    <code className="bg-gray-100 text-sm text-gray-800 px-1 py-0.5 rounded">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto my-4">{children}</pre>
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
