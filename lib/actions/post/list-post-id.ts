import { and, isNotNull, isNull } from "drizzle-orm";

import { subscribeRequestHandler } from "@lib/utils";
import { db } from "@lib/drizzle";
import { ensurePostTable, posts } from "@models/post";
import type { ListPostIdResult } from "./types";


const listPostId = subscribeRequestHandler({
  method: "GET",
  endpoint: "/post/all-id",
  name: "listPostId",
  async execute(_): Promise<ListPostIdResult> {
    const where = and(
      isNull(posts.deletedAt),
      isNotNull(posts.url),
    );

    await ensurePostTable(db);
    
    const list = await db.select({ id: posts.id }).from(posts).where(where);

    return {
      items: list.map(({ id }) => id),
      count: list.length,
    };
  },
});

export default listPostId;
