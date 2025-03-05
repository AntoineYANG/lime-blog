import path from "path";
import fs from "fs-extra";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { parse as parseCSV, write as writeCSV } from "fast-csv";
import { nanoid } from "nanoid";

import { UserRoleFlag, users } from "@models/user";
import { hashPassword, resolveSQLFromSchema } from "./db-helper";


const DB_DIR = path.resolve(process.cwd(), "database");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR);
}
const USER_TABLE_CSV = path.join(DB_DIR, "users.csv");


const client = createClient({
  url: "file::memory:?cache=shared",//DB_FILENAME,
});

export const db = drizzle({
  client,
  schema: {
    users,
  },
});

export async function importCSVToDatabase() {
  if (!fs.existsSync(USER_TABLE_CSV)) {
    return;
  }
  const stream = fs.createReadStream(USER_TABLE_CSV).pipe(parseCSV({ headers: true }));
  for await (const row of stream) {
    const item = row as { [key in keyof Data.User]: string };
    await db.insert(users).values({
      id: item.id,
      role: Number(item.role),
      username: item.username,
      password: item.password,
      email: item.email || undefined,
      avatar: item.avatar || undefined,
      create_at: Number(item.create_at),
    });
  }
}

export async function exportDatabaseToCSV() {
  const usersData = await db.query.users.findMany();
  const writableStream = fs.createWriteStream(USER_TABLE_CSV);
  writeCSV(usersData, { headers: true }).pipe(writableStream);
}


const initialized = {
  users: false,
};

export const sqlite = {
  users: {
    schema: users,
    async init() {
      if (initialized.users) {
        return;
      }
      initialized.users = true;
      // ensure table
      const res = await db.run(`SELECT EXISTS (
        SELECT 1 FROM sqlite_master WHERE type='table' AND name='users'
      ) AS table_exists;`);
      const exists = res.rows[0]?.table_exists === 1;
      if (exists) {
        await importCSVToDatabase();
      } else {
        await db.run(`CREATE TABLE IF NOT EXISTS users ${resolveSQLFromSchema(users, {
          create_at: "NOT NULL DEFAULT (unixepoch())",
        })};`);
        // ensure default user(s)
        await db.run(`
          INSERT INTO users (id, role, username, email, password, create_at)
          SELECT '${nanoid()}', ${UserRoleFlag.SuperAdmin}, 'admin-0', '${process.env.OWNER_USER_EMAIL}', '${await hashPassword(process.env.OWNER_USER_PASSWORD)}', unixepoch();
        `);
        await this.update();
      }
    },
    async update() {
      await exportDatabaseToCSV();
    },
  },
} as const;
