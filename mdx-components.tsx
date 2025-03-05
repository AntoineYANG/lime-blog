import type { MDXComponents } from "mdx/types";

import { mdxComponents } from "@cp/mdx";

 
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
};
