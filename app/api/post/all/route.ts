import { setupGetHandler } from "@lib/utils";
import { OrderDirection } from "@lib/constants";
import Post, { type ListPostPayload } from "@actions/post";


export const GET = setupGetHandler(Post.listPost, {
  pageSize: raw => Number(raw),
  ps: raw => Number(raw),
  pageIndex: raw => Number(raw),
  pi: raw => Number(raw),
  orderDirection: raw => raw === `${OrderDirection.ASC}` ? OrderDirection.ASC : OrderDirection.DESC,
  od: raw => raw === `${OrderDirection.ASC}` ? OrderDirection.ASC : OrderDirection.DESC,
  orderBy: raw => raw === "created time" ? "created time" : "updated time",
  ob: raw => raw === "created time" ? "created time" : "updated time",
  updatedTime: raw => raw as ListPostPayload["updatedTime"],
  ut: raw => raw as ListPostPayload["updatedTime"],
});
