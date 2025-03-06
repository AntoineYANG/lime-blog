import type { NextRequest } from "next/server";


declare global {

  type RequestHandlerCaller<RequiresPayload extends boolean> = RequiresPayload extends true ? (
    | ((payload: Record<string, unknown>) => Promise<unknown>)
  ) : (
    | (() => Promise<unknown>)
  );

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


type InferRequiresPayload<C extends RequestHandlerCaller<boolean>> = C extends (payload: unknown) => Promise<unknown> ? false : true;
type InferPayload<C extends RequestHandlerCaller<true>> = C extends (payload: infer P) => Promise<unknown> ? P : unknown;
type InferRespond<C extends RequestHandlerCaller<true>> = ReturnType<C>;

export const subscribeRequestHandler = <
  Endpoint extends string,
  HandlerName extends string,
  Caller extends RequestHandlerCaller<boolean>,
>(
  endpoint: Endpoint,
  name: HandlerName,
  caller: Caller,
  errorHandler?: (error: unknown) => (IResult<Awaited<ReturnType<Caller>>> | undefined | null | void),
): RequestEntry<Endpoint, HandlerName, InferRequiresPayload<Caller>, InferPayload<Caller>, InferRespond<Caller>> => {
  const requiresPayload = caller.length !== 0;
  const handler = (async (...args: Parameters<Caller>): Promise<IResult<Awaited<ReturnType<Caller>>>> => {
    try {
      // @ts-expect-error checked by caller.length
      const result = requiresPayload ? await caller(args[0]) : await caller();
      return {
        success: true,
        data: result as Awaited<ReturnType<Caller>>,
      };
    } catch (error) {
      return errorHandler?.(error) ?? {
        success: false,
        reason: `${error}`,
      };
    }
  }) as RequestHandler<InferPayload<Caller>, InferRespond<Caller>>;
  return {
    endpoint,
    name,
    handler,
    requiresPayload,
  } as RequestEntry<Endpoint, HandlerName, InferRequiresPayload<Caller>, InferPayload<Caller>, InferRespond<Caller>>;
};

type InferParamResolver<P extends Record<string, unknown>> = {
  [key in keyof P]-?: (raw: string | undefined) => P[key]
};

interface SetupGetHandler {
  <
    Endpoint extends string,
    HandlerName extends string,
    Payload extends Record<string, unknown>,
    Respond
  >(
    entry: RequestEntry<Endpoint, HandlerName, true, Payload, Respond>,
    paramResolver: InferParamResolver<Payload>
  ): ((req: NextRequest) => Promise<Response>);

  <
    Endpoint extends string,
    HandlerName extends string,
    Respond
  >(
    entry: RequestEntry<Endpoint, HandlerName, false, void, Respond>,
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
      const pr = paramResolver as NonNullable<typeof paramResolver>;
      const searchParams = req.nextUrl.searchParams;
      const payload = {} as { [key in keyof InferPayload<E["handler"]>]: InferPayload<E["handler"]>[key] };
      for (const key of Object.keys(pr)) {
        const raw = searchParams.get(key) ?? undefined;
        const k = key as keyof InferPayload<E["handler"]>;
        // @ts-expect-error checked
        payload[k] = pr[k](raw);
      }
      // @ts-expect-error checked by caller.length
      const res = await entry.handler(payload);
      return new Response(JSON.stringify(res), { status: 200 });
    }
    const res = await entry.handler();
    return new Response(JSON.stringify(res), { status: 200 });
  }
}) as SetupGetHandler;
