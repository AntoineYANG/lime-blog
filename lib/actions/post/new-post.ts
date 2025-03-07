import { nanoid } from "nanoid";
import { put } from "@vercel/blob";

import { LOCAL_OBJECT_STORAGE_PATH } from "@/constants";
import { subscribeRequestHandler } from "@lib/utils";
import { BadPayloadErrorMessage } from "@lib/errors";
import { db } from "@lib/drizzle";
import { ensurePostTable, posts } from "@models/post";
import type { NewPostPayload, NewPostResult } from "./types";


const MAX_TITLE_LEN = 64 - 1;

const target = process.env.USE_LOCAL_OBJECT_STORAGE === "true" ? "local" : "vercel/blob";

const newPost = subscribeRequestHandler({
  method: "POST",
  endpoint: "/post/new",
  name: "newPost",
  requiresAuth: true,
  async execute({ user }, payload: NewPostPayload): Promise<NewPostResult> {
    const { title: t, content } = payload;
    const title = typeof t === "string" ? t.trim().slice(0, MAX_TITLE_LEN) : "";
    if (!title) {
      const err = new BadPayloadErrorMessage(`Expect "title" to be "string" and not empty, received "${typeof t === "string" ? t : typeof t}".`);
      throw err;
    }

    const id = nanoid();
    const timestamp = Math.floor(Date.now() / 1_000);

    const blob = new Blob([content], { type: "text/plain" });
    const file = new File([blob], id, { type: "text/plain" });

    let url: string;

    if (target === "local") {
      const fs = await import("fs-extra");
      await fs.ensureDir(LOCAL_OBJECT_STORAGE_PATH);
      const path = await import("path");
      const filepath = path.join(LOCAL_OBJECT_STORAGE_PATH, id);
      const buffer = await file.arrayBuffer();
      await fs.writeFile(filepath, Buffer.from(buffer));
      url = `/${[LOCAL_OBJECT_STORAGE_PATH.split(/(\/|\\)/g).at(-1), id].join("/")}`;
    } else {
      const blob = await put(file.name, file, { access: "public" });
      url = blob.url;
    }

    await ensurePostTable(db);

    await db.insert(posts).values({
      id,
      url,
      authorId: user.id,
      title,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return { id };
  },
});

export default newPost;
