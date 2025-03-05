/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "path";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { SQLiteColumn, SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";


export type Database<T> = T extends SQLiteTableWithColumns<{
  name: infer TTableName extends string;
  schema: infer _TSchema extends string | undefined;
  columns: infer _TColumns extends Record<string, SQLiteColumn<any, {}, {}>>;
  dialect: 'sqlite';
}> ? LibSQLDatabase<{ [key in TTableName]: T }> : never;

export const DB_DIR = path.resolve(process.cwd(), "database");
