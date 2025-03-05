import bcrypt from "bcrypt";
import type { SQLiteTableWithColumns, TableConfig } from "drizzle-orm/sqlite-core";


export const resolveSQLFromSchema = <T extends TableConfig>(
  schema: SQLiteTableWithColumns<T>,
  replacer?: { [key in keyof T['columns']]?: string | ((column: T['columns'][string]) => string) }
): string => {
  const allKeysText: string[] = [];
  for (const key of Object.keys(schema)) {
    const col = schema[key];
    let t = `${col.name} ${col.getSQLType().toUpperCase()}`;
    const rep = replacer?.[key];
    if (rep) {
      t += ` ${typeof rep === 'string' ? rep : rep(col)}`.replace(/^  /, '');
    } else {
      if (col.primary) {
        t += ` PRIMARY KEY`;
      } else {
        if (col.isUnique) {
          t += ` UNIQUE`;
        }
        if (col.notNull) {
          t += ` NOT NULL`;
        }
        if (col.hasDefault) {
          t += ` DEFAULT ${typeof col.default === "number" ? col.default : `'${col.default}'`}`;
        }
      }
    }
    allKeysText.push(t);
  }
  return `(${allKeysText.map((t, i, { length: len }) => `\n  ${t}${i < len - 1 ? ',' : '\n'}`).join('')})`;
};

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}
