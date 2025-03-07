import { isNotNull } from "drizzle-orm";

import { db, sqlite } from "@lib/drizzle";
import type { IListPostIdResult } from "@lib/actions/posts";
import { posts } from "@models/post";


export async function GET() {
  await sqlite.posts.init(db);

  const list = await db.select({ id: posts.id }).from(posts).where(isNotNull(posts.deletedAt));

  const data: IResult<IListPostIdResult> = {
    success: true,
    data: {
      items: list.map(({ id }) => id),
      count: list.length,
    },
  };

  return new Response(JSON.stringify(data), { status: 200 });
}
