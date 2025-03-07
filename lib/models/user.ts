import { integer, pgTable, text } from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { nanoid } from "nanoid";

import { type Database, UserRoleFlag } from "@lib/types";
import { ensureTableFunction, hashPassword, resolveCreateTableSQL } from "@lib/utils";


declare global {
  namespace Data {
    interface User {
      id: string;
      role: UserRoleFlag;
      username: string;
      email: string;
      password: string;
      avatar: string;
      createdAt: number;
      deletedAt?: number;
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
  createdAt: integer("created_at").default(Math.floor(Date.now() / 1_000)).notNull(), // Unix stamp
  deletedAt: integer("deleted_at"),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type IUser = Omit<Data.User, "password" | "deletedAt">;

export const ensureUserTable = ensureTableFunction(async (db: Database<typeof users>) => {
  await db.execute(resolveCreateTableSQL("users", users, {
    createdAt: "NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))",
  }));
  // ensure default user(s)
  const defaultUser = await db.query.users.findFirst({
    where(users, op) {
      return op.and(op.isNull(users.id), op.eq(users.role, UserRoleFlag.SuperAdmin), op.eq(users.email, process.env.OWNER_USER_EMAIL));
    },
  });
  if (!defaultUser) {
    await db.insert(users).values({
      id: nanoid(),
      role: UserRoleFlag.SuperAdmin,
      username: "admin-0",
      email: process.env.OWNER_USER_EMAIL,
      password: await hashPassword(process.env.OWNER_USER_PASSWORD),
    }).onConflictDoNothing();
  }
});
