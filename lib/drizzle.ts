import fs from "fs-extra";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

import { users } from "@models/user";
import { posts } from "@models/post";
import { DB_DIR } from "./tables/constants";
import userTable from "./tables/users";
import postTable from "./tables/posts";


if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR);
}

const client = createClient({
  url: "file::memory:?cache=shared",
});

export const db = drizzle({
  client,
  schema: {
    users,
    posts,
  },
});

export const sqlite = {
  users: userTable,
  posts: postTable,
} as const;
