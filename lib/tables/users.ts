import path from "path";
import fs from "fs-extra";
import { parse as parseCSV, write as writeCSV } from "fast-csv";
import { nanoid } from "nanoid";

import { UserRoleFlag, users } from "@models/user";
import { hashPassword, resolveSQLFromSchema } from "@lib/db-helper";
import { type Database, DB_DIR } from "./constants";


const USER_TABLE_CSV = path.join(DB_DIR, "users.csv");


async function importCSVToDatabase(db: Database<typeof users>) {
  if (!fs.existsSync(USER_TABLE_CSV)) {
    return;
  }
  const stream = fs.createReadStream(USER_TABLE_CSV).pipe(parseCSV({ headers: true }));
  for await (const row of stream) {
    const item = row as { [key in keyof Data.User]: Data.User[key] extends NonNullable<Data.User[key]> ? string : (string | undefined) };
    await db.insert(users).values({
      id: item.id,
      role: Number(item.role),
      username: item.username,
      password: item.password,
      email: item.email || undefined,
      avatar: item.avatar || undefined,
      created_at: Number(item.created_at),
      deleted_at: item.deleted_at ? Number(item.deleted_at) : undefined,
    });
  }
}

async function exportDatabaseToCSV(db: Database<typeof users>) {
  const usersData = await db.query.users.findMany();
  const writableStream = fs.createWriteStream(USER_TABLE_CSV);
  writeCSV(usersData, { headers: true }).pipe(writableStream);
}


let initialized = false;

const userTable = {
  schema: users,
  async init(db: Database<typeof users>) {
    if (initialized) {
      return;
    }
    initialized = true;
    try {
      // ensure table
      const res = await db.run(`SELECT EXISTS (
        SELECT 1 FROM sqlite_master WHERE type='table' AND name='users'
      ) AS table_exists;`);
      const exists = res.rows[0]?.table_exists === 1;
      if (exists) {
        await importCSVToDatabase(db);
      } else {
        await db.run(`CREATE TABLE IF NOT EXISTS users ${resolveSQLFromSchema(users, {
          created_at: "NOT NULL DEFAULT (unixepoch())",
        })};`);
        // ensure default user(s)
        await db.run(`
          INSERT INTO users (id, role, username, email, password, created_at)
          SELECT '${nanoid()}', ${UserRoleFlag.SuperAdmin}, 'admin-0', '${process.env.OWNER_USER_EMAIL}', '${await hashPassword(process.env.OWNER_USER_PASSWORD)}', unixepoch();
        `);
        await this.update(db);
      }
    } catch (error) {
      console.warn(error);
    }
  },
  async update(db: Database<typeof users>) {
    await exportDatabaseToCSV(db);
  },
};


export default userTable;
