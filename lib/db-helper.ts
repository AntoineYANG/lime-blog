import bcrypt from "bcrypt";
import type { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";


export const resolveSQLFromSchema = <T extends TableConfig>(
  schema: PgTableWithColumns<T>,
  replacer?: { [key in keyof T['columns']]?: string | ((column: T['columns'][string]) => string) }
): string => {
  const allKeysText: string[] = [];
  for (const key of Object.keys(schema)) {
    const col = schema[key];
    if (typeof col !== 'object') {
      continue;
    }
    console.log([typeof col, col]);
    let t = `${col.name} ${col.columnType.replace(/^Pg/, '').toUpperCase()}`;
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
