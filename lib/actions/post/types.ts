import type { OrderDirection } from "@lib/constants";
import type { OrderByKey } from "@lib/types";
import type { IPost } from "@models/post";


export interface ListPostPayload {
  /** author ID */
  authorId?: string;
  /** updated time, not earlier than | not later than */
  updatedTime?: `~${number}` | `${number}~${number}` | `${number}~`;
  /** page size @default 20 */
  pageSize?: number;
  /** page index (beginning from 1) @default 1 */
  pageIndex?: number;
  /** order by @default "updated time" */
  orderBy?: OrderByKey;
  /** order direction @default OrderDirection.DESC */
  orderDirection?: OrderDirection;
}

export type ListPostSearchParams = WithKeysMapped<ListPostPayload, {
  authorId: "aid";
  updatedTime: "ut";
  pageSize: "ps";
  pageIndex: "pi";
  orderBy: "ob";
  orderDirection: "od";
}>;

export type ListPostPayloadCompatible = ListPostPayload & ListPostSearchParams;

export interface IPostWithPreview extends IPost {
  preview: string;
}

export interface ListPostRespond {
  items: IPostWithPreview[];
  count: number;
  /** page index (beginning from 1) */
  pageIndex: number;
  pageSize: number;
}

// export interface ListPostIdResult {
//   items: string[];
//   count: number;
// }