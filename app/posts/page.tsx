import type { FC } from "react";

import type { IListPostPayload, IListPostQuery } from "@lib/actions/posts";
import postActions, { resolveListPostPayload, unitedListPostPayload } from "@lib/actions/posts";

import SearchResultBody from "./body";


export const dynamic = 'force-dynamic';

const SearchResultPage: FC<{ searchParams: Promise<{ [key in keyof IListPostPayload]?: string | undefined }> }> = async ({ searchParams }) => {
  const query = await searchParams;
  const payload: IListPostQuery = resolveListPostPayload(query);
  const data = await postActions.fetchPostList(payload);
  
  return (
    <SearchResultBody initPayload={unitedListPostPayload(payload)} initResult={data} />
  );
};


export default SearchResultPage;
