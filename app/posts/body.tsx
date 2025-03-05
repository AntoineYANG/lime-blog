"use client";

import { useEffect, useState, type FC } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { IListPostPayload, IListPostResult } from "@lib/actions/posts";
import PostSearchView from "@cp/post-search-view.client";


export const dynamic = 'force-dynamic';

const SearchResultBody: FC<{ initPayload: IListPostPayload; initResult: IResult<IListPostResult> }> = ({ initPayload, initResult }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initPayload);

  useEffect(() => {
    const url = new URL(`/${pathname.replace(/^\//, '')}`, window.location.toString());
    const sp = url.searchParams;
    for (const [k, v] of searchParams.entries()) {
      sp.set(k, v);
    }
    const { aid, ut, ps, pi, ob, od } = query;
    if (aid) {
      sp.set('aid', aid);
    }
    if (ut) {
      sp.set('ut', ut);
    }
    if (ps) {
      sp.set('ps', `${ps}`);
    }
    if (pi) {
      sp.set('pi', `${pi}`);
    }
    if (ob) {
      sp.set('ob', ob);
    }
    if (od !== undefined) {
      sp.set('od', `${od}`);
    }
    router.replace(url.toString());
  }, [router, pathname, query, searchParams]);
  
  return (
    <PostSearchView
      initQuery={initPayload}
      initResult={initResult}
      onChange={({ query }) => setQuery(query)}
    />
  );
};


export default SearchResultBody;
