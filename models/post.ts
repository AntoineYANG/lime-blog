import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";


declare global {
  namespace Data {
    interface Post {
      id: string;
      authorId: string;
      title: string;
      created_at: number;
      updated_at: number;
      deleted_at?: number;
    }
  }
}

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  authorId: text("authorId").notNull(),
  title: text("title").notNull(),
  created_at: integer("created_at").notNull().default(Math.floor(Date.now() / 1_000)), // Unix stamp
  updated_at: integer("updated_at").notNull().default(Math.floor(Date.now() / 1_000)), // Unix stamp
  deleted_at: integer("deleted_at"), // Unix stamp
});

export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;

export type IPost = Omit<Data.Post, "deleted_at">;
