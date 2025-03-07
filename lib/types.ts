import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { PgColumn, PgTableWithColumns } from "drizzle-orm/pg-core";

import type { validOrderByKey } from "./constants";


export type Database<T> = T extends PgTableWithColumns<{
  name: infer TTableName extends string;
  schema: infer _TSchema extends string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
  columns: infer _TColumns extends Record<string, PgColumn<any, {}, {}>>;
  dialect: 'pg';
}> ? (NeonHttpDatabase<{ [key in TTableName]: T }> | PostgresJsDatabase<{ [key in TTableName]: T }>) : never;

export enum UserRoleFlag {
  Common = 0,
  Admin = 1,
  SuperAdmin = 2,
}

export type OrderByKey = typeof validOrderByKey[number];
