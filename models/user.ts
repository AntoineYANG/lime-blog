import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";


export enum UserRoleFlag {
  Common = 0,
  Admin = 1,
  SuperAdmin = 2,
}

export enum UserStatusFlag {
  Normal = 0,
  Deleted = 1,
  Hidden = 2,
}

declare global {
  namespace Data {
    interface User {
      id: string;
      status: UserStatusFlag;
      role: UserRoleFlag;
      username: string;
      email: string;
      password: string;
      avatar: string;
      create_at: number;
    }
  }
}

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  status: integer("status").notNull().default(UserStatusFlag.Normal),
  role: integer("role").notNull().default(UserRoleFlag.Common),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull().default(""),
  password: text("password").notNull(), // hashed
  avatar: text("avatar").notNull().default(""),
  create_at: integer("create_at").notNull().default(Math.floor(Date.now() / 1_000)), // Unix stamp
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type IUser = Omit<Data.User, "password">;
