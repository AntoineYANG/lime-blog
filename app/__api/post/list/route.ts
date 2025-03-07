import path from "path";
import { readFile } from "fs/promises";
import type { NextRequest } from "next/server";
import { and, asc, between, count, desc, eq, isNull } from "drizzle-orm";

import { db, sqlite } from "@lib/drizzle";
import { OrderDirection } from "@lib/constants";
import { type IListPostResult, resolveListPostPayload, type validOrderByKey, postDir } from "@lib/actions/posts";
import { posts, type IPost } from "@models/post";
import { extractContent } from "@utils/mdx";


const orderKeyMap: { [key in typeof validOrderByKey[number]]: keyof Data.Post } = {
  "created time": "createdAt",
  "updated time": "updatedAt",
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 200;

const PREVIEW_LEN = 300;

export async function GET(req: NextRequest) {
  await sqlite.posts.init(db);

  const payload = resolveListPostPayload(req.nextUrl.searchParams);

  const where = and(
    isNull(posts.deletedAt),
    payload.authorId ? eq(posts.authorId, payload.authorId) : undefined,
    payload.updatedTimeNotEarlierThan !== undefined || payload.updatedTimeNotLaterThan !== undefined ? between(
      posts.updatedAt, payload.updatedTimeNotEarlierThan ?? 0, payload.updatedTimeNotLaterThan ?? Math.ceil(Date.now() / 1_000) + 1
    ) : undefined,
  );

  const orderBy = (payload.orderDirection === OrderDirection.ASC ? asc : desc)(posts[orderKeyMap[payload.orderBy ?? "updated time"]]);

  const [{ count: total }] = await db.select({ count: count() }).from(posts).where(where).orderBy(orderBy);

  const pageIndex = payload.pageIndex ?? 1;
  const pageSize = Math.min(payload.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

  const list = await db.query.posts.findMany({
    where,
    limit: pageSize,
    offset: pageIndex - 1,
    orderBy,
  });

  const listWithPreview: (IPost & { preview: string })[] = [];
  for await (const item of list) {
    const { deletedAt: _, ...d } = item;
    const fn = path.join(postDir, `${item.id}.md`);
    try {
      const raw = await readFile(fn, 'utf8');
      const preview = await extractContent(raw);
      listWithPreview.push({
        ...d,
        preview: preview.length > PREVIEW_LEN ? preview.slice(0, PREVIEW_LEN) + '...' : preview,
      });
    } catch (error) {
      console.error(`Failed to load post id=${item.id}`, error);
    }
  }

  const data: IResult<IListPostResult> = {
    success: true,
    data: {
      items: listWithPreview,
      count: total,
      pageIndex,
      pageSize,
    },
  };

  return new Response(JSON.stringify(data), { status: 200 });
}
