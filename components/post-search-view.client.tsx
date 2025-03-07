"use client";

import { useCallback, useEffect, useRef, useState, type FC } from "react";

import type { ListPostSearchParams, ListPostResult } from "@actions/post";
import { OrderDirection } from "@lib/constants";
import Pagination from "@cp/pagination.client";
import PostList from "@cp/post-list";


// TODO: i18n

export interface IPostListProps {
  initResult?: IResult<ListPostResult>;
  initQuery?: ListPostSearchParams;
  onChange?: (value: { query: ListPostSearchParams; result: IResult<ListPostResult> }) => void;
}

const PostSearchView: FC<IPostListProps> = ({ initResult: initResult, initQuery: initQuery, onChange }) => {
  const initPropsRef = useRef(initQuery && initResult ? { query: initQuery, result: initResult } : null); // refers to the first props
  
  const [query, setQuery] = useState<Required<Pick<ListPostSearchParams, "pi" | "ob" | "od">>>({
    // aid: initPropsRef.current?.query.aid ?? "",
    // ut: initPropsRef.current?.query.ut ?? "0~",
    // ps: initPropsRef.current?.query.ps ?? 20,
    pi: initPropsRef.current?.query.pi ?? 1,
    ob: initPropsRef.current?.query.ob ?? "updated time",
    od: initPropsRef.current?.query.od ?? OrderDirection.DESC,
  });

  const [busy, setBusy] = useState(false);

  const [result, setResult] = useState<IResult<ListPostResult> | null>(initPropsRef.current?.result ?? null);

  const total = result?.success ? result.data.count : 0;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const releaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    return () => {
      if (releaseTimerRef.current) {
        clearTimeout(releaseTimerRef.current);
      }
    };
  }, []);

  const next = useCallback(async (q: typeof query) => {
    if (busy) {
      return;
    }
    setBusy(true);
    const url = new URL("/api/post/all", window.location.href);
    const sp = url.searchParams;
    for (const [k, v] of Object.entries(q)) {
      if (v) {
        sp.set(k, `${v}`);
      }
    }
    const r = await fetch(url, { method: "get" });
    const res = await r.json();
    setQuery(q);
    setResult(res);
    releaseTimerRef.current = setTimeout(() => {
      setBusy(false);
    }, 60);
    return;
  }, [busy]);
  // const refresh = useCallback(() => next({ ...query }), [next, query]);
  const handlePaginate = useCallback((value: number) => next({ ...query, pi: value }), [query, next]);

  useEffect(() => {
    if (result) {
      onChangeRef.current?.({ query, result });
    }
  }, [query, result]);

  return (
    <div className="w-full min-h-full h-[max-content] space-y-8">
      {result && (
        <>
          {result.success && (
            <>
              <div className="text-end text-gray-500">
                <p><span className="text-gray-800">{total}</span> results found</p>
              </div>
              <div className="w-full text-sm pb-4">
                {result?.success && (
                  <PostList items={result.data.items} />
                )}
              </div>
              <div className="flex-none w-full text-lg text-center">
                <Pagination
                  total={Math.ceil(total / result.data.pageSize)}
                  current={query.pi - 1}
                  onChange={handlePaginate}
                  disabled={busy}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};


export default PostSearchView;
