import fs from "fs";
import path from "path";
// import { DuckDBInstance } from "@duckdb/node-api";
import { nanoid } from "nanoid";

import type { IUser } from "@models/user";


// const instance = await DuckDBInstance.create(':memory:');
// export const connection = await instance.connect();

// db.run(`
//   CREATE TABLE IF NOT EXISTS users (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     email TEXT UNIQUE NOT NULL,
//     password TEXT NOT NULL
//   )
// `);

const DB_DIR = path.resolve(path.dirname(import.meta.url.replace(/^file:\/\/\//, '')), "..", "database");

const USER_TABLE_JSON = path.join(DB_DIR, "users.json");
if (!fs.existsSync(USER_TABLE_JSON)) {
  // fs.writeFileSync(USER_TABLE_CSV, `id,email,password\n${nanoid()},${process.env.OWNER_USER_EMAIL},${process.env.OWNER_USER_PASSWORD}`, 'utf8');
  fs.writeFileSync(USER_TABLE_JSON, JSON.stringify([
    {
      id: nanoid(),
      username: 'admin0',
      email: process.env.OWNER_USER_EMAIL,
      password: process.env.OWNER_USER_PASSWORD,
    } as Data.User
  ], undefined, 2), 'utf8');
}
// connection.run(`CREATE TABLE users AS SELECT * FROM read_csv_auto('${USER_TABLE_CSV}')`);
// function saveUserTableToCSV() {
//   db.run(`COPY users TO '${USER_TABLE_CSV}' (HEADER, DELIMITER ',')`);
// }


// FIXME:
export const authCredentials = async (email: string, password: string): Promise<IUser | null> => {
  const data = JSON.parse(fs.readFileSync(USER_TABLE_JSON, 'utf8')) as Data.User[];
  const user = data.find(user => user.email === email && user.password === password);
  return user ? {
    id: user.id,
    username: user.username,
    email: user.email,
  } : null;
};

// export { connection as db };
