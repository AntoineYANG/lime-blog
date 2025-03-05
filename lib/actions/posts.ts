import path from "path";

import { OrderDirection } from "@lib/constants";
import { IPost } from "@models/post";


export const postDir = path.join(process.cwd(), "objects", "posts");

export const validOrderByKey = [
  "created time",
  "updated time",
] as const;

export const validOrderDirection = [
  OrderDirection.DESC,
  OrderDirection.ASC,
] as const;

export interface IListPostPayload {
  /** author ID */
  aid?: string;
  /** updated time, not earlier than | not later than */
  ut?: `~${number}` | `${number}~${number}` | `${number}~`
  /** page size @default 20 */
  ps?: number;
  /** page index (beginning from 1) @default 1 */
  pi?: number;
  /** order by @default "updated time" */
  ob?: typeof validOrderByKey[number];
  /** order direction @default OrderDirection.DESC */
  od?: OrderDirection;
}

export interface IListPostQuery {
  $$type: "query";
  authorId?: string;
  updatedTimeNotEarlierThan?: number;
  updatedTimeNotLaterThan?: number;
  pageSize?: number;
  pageIndex?: number;
  orderBy?: typeof validOrderByKey[number];
  orderDirection?: OrderDirection;
}

export interface IListPostResult {
  items: (IPost & { preview: string })[];
  count: number;
  /** page index (beginning from 1) */
  pageIndex: number;
  pageSize: number;
}

export interface IListPostIdResult {
  items: string[];
  count: number;
}

export const resolveListPostPayload = (searchParams: URLSearchParams | { [key in keyof IListPostPayload]?: string | undefined }): IListPostQuery => {
  const payload: IListPostQuery = { $$type: 'query' };

  const isURLSearchParams = 'get' in searchParams && typeof searchParams.get === 'function';
  const get = (key: keyof IListPostPayload): string | undefined => {
    if (isURLSearchParams) {
      return searchParams.get(key) ?? undefined;
    } else {
      return (searchParams as { [key in keyof IListPostPayload]?: string | undefined })[key];
    }
  }

  const aid = get("aid");
  if (aid) {
    payload.authorId = aid;
  }

  const _ut = get("ut")?.split("~");
  if (_ut?.length === 2) {
    const [net, nlt] = _ut;
    if (net) {
      payload.updatedTimeNotEarlierThan = Number(net);
    }
    if (nlt) {
      payload.updatedTimeNotLaterThan = Number(nlt);
    }
  }

  const _ps = Number(get("ps"));
  if (Number.isInteger(_ps) && _ps > 1) {
    payload.pageSize = _ps;
  }

  const _pi = Number(get("pi"));
  if (Number.isInteger(_pi) && _pi > 1) {
    payload.pageIndex = _pi;
  }

  const _ob = get("ob");
  if (_ob && validOrderByKey.find(k => k === _ob)) {
    payload.orderBy = _ob as typeof validOrderByKey[number];
  }

  const _od = Number(get("od") ?? -1);
  if (_od && validOrderDirection.find(k => k === _od)) {
    payload.orderDirection = _od as typeof validOrderDirection[number];
  }

  return payload;
};

export const unitedListPostPayload = (payload: IListPostPayload | IListPostQuery): IListPostPayload => {
  if ('$$type' in payload && payload.$$type === 'query') {
    return {
      aid: payload.authorId,
      ut: payload.updatedTimeNotEarlierThan !== undefined || payload.updatedTimeNotLaterThan !== undefined ? `${
        payload.updatedTimeNotEarlierThan ?? ''
      }~${
        payload.updatedTimeNotLaterThan ?? ''
      }` as IListPostPayload['ut'] : undefined,
      ps: payload.pageSize,
      pi: payload.pageIndex,
      ob: payload.orderBy,
      od: payload.orderDirection,
    };
  } else {
    return payload as IListPostPayload;
  }
};

export interface IUploadPostPayload {
  title: string;
  content: string;
}

export interface IUploadPostResult {
  id: string;
}

const apiIdListPathname = "/api/post/all-id";
const apiListPathname = "/api/post/list";
const apiUploadPathname = "/api/post/upload";

const postActions = {
  async fetchAllPostId(): Promise<IResult<IListPostIdResult>> {
    const url = new URL(`${process.env.DEPLOY_HOST.replace(/\/$/, '')}${apiIdListPathname}`);
    const res = await fetch(url, { method: "GET" });
    const data = await res.json() as IResult<IListPostIdResult>;
    return data;
  },
  async fetchPostList(payload: IListPostPayload | IListPostQuery, urlBase?: string | undefined): Promise<IResult<IListPostResult>> {
    const url = urlBase ? new URL(apiListPathname, urlBase) : new URL(`${process.env.DEPLOY_HOST.replace(/\/$/, '')}${apiListPathname}`);
    const sp = url.searchParams;
    const { aid, ut, ps, pi, ob, od } = unitedListPostPayload(payload);
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
    const res = await fetch(url, { method: "GET" });
    const data = await res.json() as IResult<IListPostResult>;
    return data;
  },
  async upload(payload: IUploadPostPayload, urlBase: string): Promise<IResult<IUploadPostResult>> {
    const url = new URL(apiUploadPathname, urlBase);
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json() as IResult<IUploadPostResult>;
    return data;
  },
};


export default postActions;

