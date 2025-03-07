import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";

import { users } from "@models/user";
import { posts } from "@models/post";


const usePg = process.env.USE_PG_INSTEAD_OF_NEON === "true";

const sql = usePg ? postgres(process.env.DATABASE_URL) : neon(process.env.DATABASE_URL);

const schema = {
  users,
  posts,
} as const;

export const db = usePg ? drizzlePg({
  client: sql as ReturnType<typeof postgres>,
  schema,
}) : drizzle({
  client: sql as ReturnType<typeof neon>,
  schema,
});
