import { integer, pgTable, text } from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

import type { Database } from "@lib/types";
import { ensureTableFunction, resolveCreateTableSQL } from "@lib/utils";


declare global {
  namespace Data {
    interface Post {
      id: string;
      url: string;
      authorId: string;
      title: string;
      createdAt: number;
      updatedAt: number;
      deletedAt?: number;
    }
  }
}

export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  url: text("url"),
  authorId: text("author_id").notNull(),
  title: text("title").notNull(),
  createdAt: integer("created_at").notNull().default(Math.floor(Date.now() / 1_000)), // Unix stamp
  updatedAt: integer("updated_at").notNull().default(Math.floor(Date.now() / 1_000)), // Unix stamp
  deletedAt: integer("deleted_at"), // Unix stamp
});

export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;

export type IPost = Omit<Data.Post, "deletedAt">;

export const ensurePostTable = ensureTableFunction(async (db: Database<typeof posts>) => {
  await db.execute(resolveCreateTableSQL("posts", posts, {
    createdAt: "NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))",
  }));
});
