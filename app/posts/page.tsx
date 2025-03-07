import type { FC } from "react";

import type { ListPostSearchParams } from "@actions/post";
import Post from "@actions/post";

import SearchResultBody from "./body";


export const dynamic = 'force-dynamic';

const SearchResultPage: FC<{ searchParams: Promise<{ [key in keyof ListPostSearchParams]?: string | undefined }> }> = async ({ searchParams }) => {
  const query = await searchParams as ListPostSearchParams;
  const data = await Post.listPost.call({});
  
  return (
    <SearchResultBody initSearch={query} initResult={data} />
  );
};


export default SearchResultPage;
