import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import { nanoid } from "nanoid";

import { users } from "@models/user";
import { hashPassword, resolveSQLFromSchema } from "./db-helper";
import { UserRoleFlag } from "./types";


const usePg = process.env.USE_PG_INSTEAD_OF_NEON === "true";

const sql = usePg ? postgres(process.env.DATABASE_URL) : neon(process.env.DATABASE_URL);

const schema = {
  users,
} as const;

export const db = usePg ? drizzlePg({
  client: sql as ReturnType<typeof postgres>,
  schema,
}) : drizzle({
  client: sql as ReturnType<typeof neon>,
  schema,
});

async function ensureTables() {
  await db.execute(`CREATE TABLE IF NOT EXISTS users ${resolveSQLFromSchema(users, {
    created_at: "NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))",
  })};`);
  // ensure default user(s)
  await db.execute(`
    INSERT INTO users (id, role, username, email, password, created_at)
    SELECT '${nanoid()}', ${UserRoleFlag.SuperAdmin}, 'admin-0', '${process.env.OWNER_USER_EMAIL}', '${await hashPassword(process.env.OWNER_USER_PASSWORD)}', EXTRACT(EPOCH FROM NOW());
  `);
}

ensureTables();
