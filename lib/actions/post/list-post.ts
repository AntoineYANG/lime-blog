import { and, asc, between, count, desc, eq, isNotNull, isNull } from "drizzle-orm";

import { withKeysMapped } from "@utils/types";
import { extractContent } from "@utils/mdx";
import { subscribeRequestHandler } from "@lib/utils";
import { OrderDirection } from "@lib/constants";
import { ObjectNoReferenceErrorMessage, ObjectNotFoundErrorMessage } from "@lib/errors";
import { db } from "@lib/drizzle";
import type { OrderByKey } from "@lib/types";
import { ensurePostTable, posts } from "@models/post";
import type { IPostWithPreview, ListPostPayload, ListPostPayloadCompatible, ListPostResult } from "./types";


const normalizeListPostPayload = (raw: ListPostPayloadCompatible): ListPostPayload => {
  return withKeysMapped(raw, {
    aid: "authorId",
    ut: "updateTime",
    ps: "pageSize",
    pi: "pageIndex",
    ob: "orderBy",
    od: "orderDirection",
  });
};

const orderKeyMap: { [key in OrderByKey]: keyof Data.Post } = {
  "created time": "createdAt",
  "updated time": "updatedAt",
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 200;

const PREVIEW_LEN = 300;

const listPost = subscribeRequestHandler({
  method: "GET",
  endpoint: "/post/all",
  name: "listPost",
  async execute(_, payloadRaw: ListPostPayloadCompatible): Promise<ListPostResult> {
    const payload = normalizeListPostPayload(payloadRaw);

    const {
      authorId,
      updatedTime,
      pageSize: _pageSize = DEFAULT_PAGE_SIZE,
      pageIndex = 1,
      orderBy: ob,
      orderDirection,
    } = payload;

    const pageSize = Math.min(payload.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const { net, nlt } = /^(?<net>\d*)~(?<nlt>\d*)$/.exec(updatedTime ?? '')?.groups ?? {};
    const updatedTimeNotEarlierThan = net ? Number(net) : 0;
    const updatedTimeNotLaterThan = nlt ? Number(nlt) : Math.ceil(Date.now() / 1_000) + 1;

    const where = and(
      isNull(posts.deletedAt),
      isNotNull(posts.url),
      authorId ? eq(posts.authorId, authorId) : undefined,
      between(posts.updatedAt, updatedTimeNotEarlierThan, updatedTimeNotLaterThan),
    );

    const orderBy = (orderDirection === OrderDirection.ASC ? asc : desc)(posts[orderKeyMap[ob ?? "updated time"] ?? "updated_at"]);

    await ensurePostTable(db);
    
    let [{ count: total }] = await db.select({ count: count() }).from(posts).where(where);

    const list = await db.query.posts.findMany({
      where,
      limit: pageSize,
      offset: pageIndex - 1,
      orderBy,
    });

    const listWithPreview: IPostWithPreview[] = [];
    for await (const item of list) {
      const { deletedAt: _, url, ...d } = item;
      try {
        if (!url) {
          const err = new ObjectNoReferenceErrorMessage(`Fetch object failed: url is invalid (post id: ${item.id}`);
          throw err;
        }
        const object = await fetch(new URL(url, process.env.DEPLOY_HOST));
        if (!object.ok) {
          const err = new ObjectNotFoundErrorMessage(`Fetch object failed: ${object.status} - ${object.statusText}`);
          throw err;
        }
        const raw = await object.text();
        const preview = await extractContent(raw);
        listWithPreview.push({
          ...d,
          url,
          preview: preview.length > PREVIEW_LEN ? preview.slice(0, PREVIEW_LEN) + '...' : preview,
        });
      } catch (error) {
        console.error(`Failed to load post id=${item.id}`, error, item);
        total -= 1;
      }
    }

    return {
      items: listWithPreview,
      count: total,
      pageIndex,
      pageSize,
    };
  },
});

export default listPost;
