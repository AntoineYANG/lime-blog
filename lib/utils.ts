/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from "bcrypt";
import type { NextRequest } from "next/server";
import type { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";
import { Column } from "drizzle-orm";

import type { db as _db } from "./drizzle";


declare global {

  type RequestExecutor<Payload extends Record<string, unknown> | unknown, Respond> = Payload extends Record<string, undefined> ? {
    (payload: Payload): Promise<IResult<Respond>>;
  } : {
    (): Promise<IResult<Respond>>;
  };

  type RequestHandler<Payload extends Record<string, unknown> | unknown, Respond> = Payload extends Record<string, undefined> ? {
    (payload: Payload): Promise<IResult<Respond>>;
  } : {
    (): Promise<IResult<Respond>>;
  };

  type RequestEntry<
    Endpoint extends string,
    HandlerName extends string,
    RequiresPayload extends boolean,
    Payload extends Record<string, unknown> | unknown,
    Respond
  > = {
    readonly endpoint: Endpoint;
    readonly name: HandlerName;
    readonly handler: RequestHandler<Payload, Respond>;
    readonly requiresPayload: RequiresPayload;
  };

}


type InferRequiresPayload<C extends (payload?: any) => any> = C extends (payload: unknown) => Promise<unknown> ? false : true;
type InferPayload<C extends (payload?: any) => any> = C extends (payload: infer P) => Promise<unknown> ? P : unknown;
type InferRespond<C extends (payload?: any) => any> = ReturnType<C>;

export type RequestHandlerConfig<
  Endpoint extends string,
  HandlerName extends string,
  Executor extends (payload?: any) => any,
> = {
  endpoint: Endpoint;
  name: HandlerName;
  execute: Executor;
  onError?: (error: unknown) => (IResult<Awaited<ReturnType<Executor>>> | undefined | null | void);
};

export const subscribeRequestHandler = (<
  Endpoint extends string,
  HandlerName extends string,
  Executor extends (payload?: any) => unknown,
>(config: RequestHandlerConfig<Endpoint, HandlerName, Executor>) => {
  const { endpoint, name, execute, onError } = config;
  const requiresPayload = execute.length !== 0;
  const handler = (async (...args: Parameters<Executor>): Promise<IResult<Awaited<ReturnType<Executor>>>> => {
    try {
      const result = requiresPayload ? await execute(args[0]) : await execute();
      return {
        success: true,
        data: result as Awaited<ReturnType<Executor>>,
      };
    } catch (error) {
      return onError?.(error) ?? {
        success: false,
        reason: `${error}`,
      };
    }
  }) as RequestHandler<InferPayload<Executor>, InferRespond<Executor>>;
  return {
    endpoint,
    name,
    handler,
    requiresPayload,
  } as RequestEntry<Endpoint, HandlerName, InferRequiresPayload<Executor>, InferPayload<Executor>, InferRespond<Executor>>;
});

type InferParamResolver<P extends Record<string, any>> = {
  [key in keyof P as string extends NonNullable<P[key]> ? never : key]-?: (raw: string | undefined) => P[key];
} & Partial<{
  [key in keyof P as string extends NonNullable<P[key]> ? key : never]: (raw: string | undefined) => P[key];
}>;

type PayloadOfEntry<E extends RequestEntry<string, string, true, any, any>> = E extends RequestEntry<string, string, true, infer P, any> ? P : never;

interface SetupGetHandler {

  <E extends RequestEntry<string, string, true, any, any>, P extends PayloadOfEntry<E>, R extends InferParamResolver<P>>(
    entry: E,
    ...[paramResolver]: Record<string, never> extends R ? [R?] : [R]
  ): ((req: NextRequest) => Promise<Response>);

  <E extends RequestEntry<string, string, false, any, any>>(
    entry: E
  ): ((req: NextRequest) => Promise<Response>);

}

export const setupGetHandler = (<
  RequiresPayload extends boolean,
  E extends RequestEntry<string, string, RequiresPayload, Record<string, unknown> | unknown, unknown>
>(
  entry: E,
  paramResolver?: InferParamResolver<E> | undefined,
): ((req: NextRequest) => Promise<Response>) => {
  return async function GET (req: NextRequest): Promise<Response> {
    if (entry.requiresPayload) {
      const pr = paramResolver as NonNullable<typeof paramResolver> | undefined;
      const searchParams = req.nextUrl.searchParams;
      const payload = {} as { [key in keyof InferPayload<E["handler"]>]: InferPayload<E["handler"]>[key] };
      for (const [k, v] of searchParams.entries()) {
        if (typeof v === "string" && !pr?.[k as keyof typeof pr]) {
        // @ts-expect-error checked
          payload[k] = v;
        }
      }
      if (pr) {
        for (const key of Object.keys(pr)) {
          const raw = searchParams.get(key);
          if (!raw) {
            continue;
          }
          const k = key as keyof InferPayload<E["handler"]>;
          // @ts-expect-error checked
          payload[k] = pr[k](raw);
        }
      }
      // @ts-expect-error checked by caller.length
      const res = await entry.handler(payload);
      return new Response(JSON.stringify(res), { status: 200 });
    }
    const res = await entry.handler();
    return new Response(JSON.stringify(res), { status: 200 });
  }
}) as SetupGetHandler;

export const resolveCreateTableSQL = <TableName extends string, T extends TableConfig & { name: TableName }>(
  tableName: TableName,
  schema: PgTableWithColumns<T>,
  replacer?: { [key in keyof T['columns']]?: string | ((column: T['columns'][string]) => string) }
): string => {
  const allKeysText: string[] = [];
  for (const key of Object.keys(schema)) {
    const col = schema[key];
    if (typeof col !== 'object' || !(col instanceof Column)) {
      continue;
    }
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
  return `CREATE TABLE IF NOT EXISTS ${tableName} (\n${allKeysText.map((t, i, { length: len }) => `\n  ${t}${i < len - 1 ? ',' : '\n'}`).join('')}\n);`;
};

export const ensureTableFunction = (callback: (db: typeof _db) => Promise<void>) => {
  let busy = false;
  let initialized = false;
  const cb: (() => void)[] = [];
  return async (db: typeof _db) => {
    if (initialized) {
      return;
    }
    if (busy) {
      return new Promise<void>(resolve => {
        cb.push(resolve);
      });
    }
    busy = true;
    await callback(db);
    initialized = true;
    busy = false;
    for (const c of cb) {
      c();
    }
  };
};

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}
