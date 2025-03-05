import path from "path";
import fs from "fs-extra";
import { parse as parseCSV, write as writeCSV } from "fast-csv";

import { resolveSQLFromSchema } from "@lib/db-helper";
import { posts } from "@models/post";
import { type Database, DB_DIR } from "./constants";


const POST_TABLE_CSV = path.join(DB_DIR, "posts.csv");


async function importCSVToDatabase(db: Database<typeof posts>) {
  if (!fs.existsSync(POST_TABLE_CSV)) {
    return;
  }
  const stream = fs.createReadStream(POST_TABLE_CSV).pipe(parseCSV({ headers: true }));
  for await (const row of stream) {
    const item = row as { [key in keyof Data.Post]: Data.Post[key] extends NonNullable<Data.Post[key]> ? string : (string | undefined) };
    await db.insert(posts).values({
      id: item.id,
      authorId: item.authorId,
      title: item.title,
      created_at: Number(item.created_at),
      updated_at: Number(item.updated_at),
      deleted_at: item.deleted_at ? Number(item.deleted_at) : undefined,
    });
  }
}

async function exportDatabaseToCSV(db: Database<typeof posts>) {
  const usersData = await db.query.posts.findMany();
  const writableStream = fs.createWriteStream(POST_TABLE_CSV);
  writeCSV(usersData, { headers: true }).pipe(writableStream);
}


let initialized = false;

const postTable = {
  schema: posts,
  async init(db: Database<typeof posts>) {
    if (initialized) {
      return;
    }
    initialized = true;
    try {
      // ensure table
      const res = await db.run(`SELECT EXISTS (
        SELECT 1 FROM sqlite_master WHERE type='table' AND name='posts'
      ) AS table_exists;`);
      const exists = res.rows[0]?.table_exists === 1;
      if (exists) {
        await importCSVToDatabase(db);
      } else {
        await db.run(`CREATE TABLE IF NOT EXISTS posts ${resolveSQLFromSchema(posts, {
          created_at: "NOT NULL DEFAULT (unixepoch())",
        })};`);
        await this.update(db);
      }
    } catch (error) {
      console.warn(error);
    }
  },
  async update(db: Database<typeof posts>) {
    await exportDatabaseToCSV(db);
  },
};


export default postTable;
