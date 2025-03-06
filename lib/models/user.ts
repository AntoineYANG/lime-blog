import { integer, pgTable, text } from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

import { UserRoleFlag } from "@lib/types";


declare global {
  namespace Data {
    interface User {
      id: string;
      role: UserRoleFlag;
      username: string;
      email: string;
      password: string;
      avatar: string;
      created_at: number;
      deleted_at?: number;
    }
  }
}

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  role: integer("role").default(UserRoleFlag.Common).notNull(),
  username: text("username").unique().notNull(),
  email: text("email").default("").notNull(),
  password: text("password").notNull(), // hashed
  avatar: text("avatar").default("").notNull(),
  created_at: integer("created_at").default(Math.floor(Date.now() / 1_000)).notNull(), // Unix stamp
  deleted_at: integer("deleted_at"),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type IUser = Omit<Data.User, "password" | "deleted_at">;
