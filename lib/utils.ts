/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import type { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";
import { Column } from "drizzle-orm";

import { LoggedOutErrorMessage } from "./errors";
import type { db as _db } from "./drizzle";


declare global {

  type RequestEntry<
    Method extends HttpMethod,
    Endpoint extends string,
    HandlerName extends string,
    RequiresPayload extends boolean,
    RequiresAuth extends boolean,
    EnableFile extends boolean,
    Payload extends Record<string, unknown> | unknown,
    Result
  > = {
    readonly method: Method,
    readonly endpoint: Endpoint;
    readonly name: HandlerName;
    readonly call: (...args: RequestActionParameters<EnableFile, Payload>) => RequestActionReturn<Result>;
    readonly requiresPayload: RequiresPayload;
    readonly requiresAuth: RequiresAuth;
    readonly enableFile: EnableFile;
  };

}


type InferRequiresPayload<C extends (ctx: any, payload?: any) => any> = C extends (ctx: any, payload: unknown) => Promise<unknown> ? false : true;
type Slice1<T extends Array<any>> = T extends [any, ...infer B] ? B : never;
type InferPayload<C extends (ctx: any, payload?: any) => any> = Slice1<Parameters<C>>[0];
type InferRespond<C extends (payload?: any) => any> = ReturnType<C>;

type RequestActionParameters<
  EnableFile extends boolean,
  Payload extends Record<string, unknown> | unknown,
> = EnableFile extends true ? (
  unknown extends Payload ? [file: File | null] : {} extends Payload ? [file: File | null, payload?: Payload] : [file: File | null, payload: Payload]
) : (
  unknown extends Payload ? [] : {} extends Payload ? [payload?: Payload] : [payload: Payload]
);

type RequestActionReturn<Result> = Promise<IResult<Awaited<Result>>>;

export interface RequestHandlerConfig<
  Method extends HttpMethod,
  Endpoint extends string,
  HandlerName extends string,
  RequiresAuth extends boolean,
  EnableFile extends boolean,
  Context extends (
    & (RequiresAuth extends true ? { user: SessionUser } : {})
    & (EnableFile extends true ? { file: File | null } : {})
  ),
  Executor extends (context: Context, payload?: Record<string, any>) => any
> {
  method: Method;
  endpoint: Endpoint;
  name: HandlerName;
  /** @default false */
  requiresAuth?: RequiresAuth;
  /** @default false */
  enableFile?: EnableFile;
  execute: Executor;
  onError?: (error: unknown) => (IResult<Awaited<ReturnType<Executor>>> | undefined | null | void);
}

interface SubscribeRequestHandler {

  // requiresAuth=false, enableFile=false
  <
    Method extends HttpMethod,
    Endpoint extends string,
    HandlerName extends string,
    Context extends {},
    Executor extends (context: Context, payload?: any) => unknown
  >(config: RequestHandlerConfig<Method, Endpoint, HandlerName, false, false, Context, Executor>): (
    RequestEntry<Method, Endpoint, HandlerName, InferRequiresPayload<Executor>, false, false, InferPayload<Executor>, InferRespond<Executor>>
  );

  // requiresAuth=false, enableFile=true
  <
    Method extends HttpMethod,
    Endpoint extends string,
    HandlerName extends string,
    Context extends { file: File | null },
    Executor extends (context: Context, payload?: any) => unknown
  >(config: RequestHandlerConfig<Method, Endpoint, HandlerName, false, true, Context, Executor>): (
    RequestEntry<Method, Endpoint, HandlerName, InferRequiresPayload<Executor>, false, true, InferPayload<Executor>, InferRespond<Executor>>
  );

  // requiresAuth=true, enableFile=false
  <
    Method extends HttpMethod,
    Endpoint extends string,
    HandlerName extends string,
    Context extends { user: SessionUser },
    Executor extends (context: Context, payload?: any) => unknown
  >(config: RequestHandlerConfig<Method, Endpoint, HandlerName, true, false, Context, Executor>): (
    RequestEntry<Method, Endpoint, HandlerName, InferRequiresPayload<Executor>, false, false, InferPayload<Executor>, InferRespond<Executor>>
  );

  // requiresAuth=true, enableFile=true
  <
    Method extends HttpMethod,
    Endpoint extends string,
    HandlerName extends string,
    Context extends { user: SessionUser; file: File | null },
    Executor extends (context: Context, payload?: any) => unknown
  >(config: RequestHandlerConfig<Method, Endpoint, HandlerName, true, true, Context, Executor>): (
    RequestEntry<Method, Endpoint, HandlerName, InferRequiresPayload<Executor>, true, true, InferPayload<Executor>, InferRespond<Executor>>
  );

}

export const subscribeRequestHandler = (<
  Method extends HttpMethod,
  Endpoint extends string,
  HandlerName extends string,
  RequiresAuth extends boolean,
  EnableFile extends boolean,
  Context extends (
    & (RequiresAuth extends true ? { user: SessionUser } : {})
    & (EnableFile extends true ? { file: File | null } : {})
  ),
  Executor extends (context: Context, payload?: any) => unknown
>(config: RequestHandlerConfig<Method, Endpoint, HandlerName, RequiresAuth, EnableFile, Context, Executor>) => {
  const { method, endpoint, name, requiresAuth = false, enableFile = false, execute, onError } = config;
  const requiresPayload = execute.length === 2;
  const call = async (...args: Slice1<Parameters<Executor>>): Promise<IResult<Awaited<ReturnType<Executor>>>> => {
    try {
      const ctx = {} as Context;
      if (enableFile) {
        // @ts-expect-error checked
        ctx.file = args[0] ?? null;
      }
      // @ts-expect-error checked
      const payload = enableFile ? args[1] : args[0];
      if (requiresAuth) {
        const { default: authOptions } = await import("@lib/auth");
        const session = (await getServerSession(authOptions)) as null | AppSession;
        if (!session?.appUser) {
          const err = new LoggedOutErrorMessage();
          throw err;
        }
        // @ts-expect-error checked
        ctx.user = session.appUser;
      }
      const result = requiresPayload ? await execute(ctx, payload) : await (execute as (context: Context) => Promise<ReturnType<Executor>>)(ctx);
      return {
        success: true,
        data: result as Awaited<ReturnType<Executor>>,
      };
    } catch (error) {
      console.error(error);
      return onError?.(error) ?? {
        success: false,
        reason: `${error}`,
      };
    }
  };
  const handler = {
    method,
    endpoint,
    name,
    call,
    requiresPayload,
  };
  return new Proxy(handler, {
    apply(target, _thisArg: undefined, args: Parameters<typeof call>): ReturnType<typeof call> {
      return target.call(...args);
    },
  });
}) as SubscribeRequestHandler;

type InferParamResolver<P extends Record<string, any>> = {
  [key in keyof P as string extends NonNullable<P[key]> ? never : key]-?: (raw: string | undefined) => P[key];
} & Partial<{
  [key in keyof P as string extends NonNullable<P[key]> ? key : never]: (raw: string | undefined) => P[key];
}>;

type PayloadOfEntry<E extends RequestEntry<HttpMethod, string, string, true, boolean, boolean, any, any>> = E extends RequestEntry<HttpMethod, string, string, true, boolean, boolean, infer P, any> ? P : never;

interface SetupGetHandler {

  <E extends RequestEntry<"GET", string, string, true, boolean, false, any, any>, P extends PayloadOfEntry<E>, R extends InferParamResolver<P>>(
    entry: E,
    ...[paramResolver]: Record<string, never> extends R ? [R?] : [R]
  ): ((req: NextRequest) => Promise<Response>);

  <E extends RequestEntry<"GET", string, string, false, boolean, false, any, any>>(
    entry: E
  ): ((req: NextRequest) => Promise<Response>);

}

export const setupGetHandler = (<
  RequiresPayload extends boolean,
  E extends RequestEntry<"GET", string, string, RequiresPayload, boolean, false, Record<string, unknown> | unknown, unknown>
>(
  entry: E,
  paramResolver?: InferParamResolver<E> | undefined,
): ((req: NextRequest) => Promise<Response>) => {
  return async function GET (req: NextRequest): Promise<Response> {
    if (entry.requiresPayload) {
      const pr = paramResolver as NonNullable<typeof paramResolver> | undefined;
      const searchParams = req.nextUrl.searchParams;
      const payload = {} as { [key in keyof InferPayload<E["call"]>]: InferPayload<E["call"]>[key] };
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
          const k = key as keyof InferPayload<E["call"]>;
          // @ts-expect-error checked
          payload[k] = pr[k](raw);
        }
      }
      // @ts-expect-error checked by caller.length
      const res = await entry.call(payload);
      return new Response(JSON.stringify(res), { status: 200 });
    }
    const res = await entry.call();
    return new Response(JSON.stringify(res), { status: 200 });
  }
}) as SetupGetHandler;

type SetupPostHandler = <E extends RequestEntry<"POST", string, string, boolean, boolean, false, any, any>>(
  entry: E,
  /** @default 200 */
  successCode?: 200 | 201 | 202 | 203
) => ((req: NextRequest) => Promise<Response>);

export const setupPostHandler = (<
  E extends RequestEntry<"POST", string, string, boolean, boolean, false, Record<string, unknown> | unknown, unknown>
>(
  entry: E,
  successCode: 200 | 201 | 202 | 203 = 200
): ((req: NextRequest) => Promise<Response>) => {
  return async function POST (req: NextRequest): Promise<Response> {
    if (entry.requiresPayload) {
      const payload = await (async () => {
        try {
          const p = await req.json();
          return p;
        } catch {
          return {};
        }
      })() as InferPayload<E["call"]>;
      // @ts-expect-error checked by caller.length
      const res = await entry.call(payload);
      return new Response(JSON.stringify(res), { status: successCode });
    }
    const res = await entry.call();
    return new Response(JSON.stringify(res), { status: successCode });
  }
}) as SetupPostHandler;

export const FORM_DATA_PAYLOAD_KEY = "metadata";
export const FORM_DATA_FILE_KEY = "file";

type SetupPostWithFileHandler = <E extends RequestEntry<"POST", string, string, boolean, boolean, true, any, any>>(
  entry: E,
  /** @default 201 */
  successCode?: 200 | 201 | 202 | 203
) => ((req: NextRequest) => Promise<Response>);

export const setupPostWithFileHandler = (<
  E extends RequestEntry<"POST", string, string, boolean, boolean, true, Record<string, unknown> | unknown, unknown>
>(
  entry: E,
  successCode: 200 | 201 | 202 | 203 = 201
): ((req: NextRequest) => Promise<Response>) => {
  return async function POST (req: NextRequest): Promise<Response> {
    const formData = await req.formData();
    const file = formData.get(FORM_DATA_FILE_KEY) as File | null;
    if (entry.requiresPayload) {
      const payloadRaw = formData.get(FORM_DATA_PAYLOAD_KEY);
      const payload = JSON.stringify(payloadRaw) as unknown as Slice1<Parameters<E["call"]>>;
      // @ts-expect-error checked by caller.length
      const res = await entry.call(file, payload);
      return new Response(JSON.stringify(res), { status: successCode });
    }
    const res = await entry.call(file);
    return new Response(JSON.stringify(res), { status: successCode });
  }
}) as SetupPostWithFileHandler;

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
