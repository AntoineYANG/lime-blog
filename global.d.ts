import type { Session } from "next-auth";

import type { IUser } from "@models/user";


declare global {

  namespace NodeJS {

    interface ProcessEnv {
      readonly DEPLOY_HOST: string;
      readonly NEXTAUTH_SECRET: string;
      readonly NEXTAUTH_URL: string;
      readonly OWNER_USER_EMAIL: string;
      readonly OWNER_USER_PASSWORD: string;
      
      readonly USE_PG_INSTEAD_OF_NEON?: "true";
      readonly DATABASE_URL: string;
      readonly DATABASE_URL_UNPOOLED: string;

      readonly PGHOST?: string;
      readonly PGHOST_UNPOOLED?: string;
      readonly PGUSER?: string;
      readonly PGDATABASE?: string;
      readonly PGPASSWORD?: string;
      readonly POSTGRES_URL?: string;
      readonly POSTGRES_URL_NON_POOLING?: string;
      readonly POSTGRES_USER?: string;
      readonly POSTGRES_HOST?: string;
      readonly POSTGRES_PASSWORD?: string;
      readonly POSTGRES_DATABASE?: string;
      readonly POSTGRES_URL_NO_SSL?: string;
      readonly POSTGRES_PRISMA_URL?: string;

      readonly USE_LOCAL_OBJECT_STORAGE?: "true";
      readonly VERCEL_BLOB_READ_WRITE_TOKEN?: string;
    }

  }

  type HttpMethod = "GET" | "POST" | "PUT";
  
  type IResult<T> = {
    success: true;
    data: T;
  } | {
    success: false;
    reason: string;
    detail?: string;
  };

  type SessionUser = Pick<IUser, "id" | "username" | "role">;

  type AppSession = Session & {
    accessToken?: unknown;
    appUser?: SessionUser | undefined | null;
  };

  type WithKeysMapped<T extends object, M extends Partial<{ [key in keyof T]: Exclude<string, keyof T> }>> = {
    [key in M[keyof M] as (T[keyof PickByValue<M, key>] | undefined) extends T[keyof PickByValue<M, key>] ? never : key]: T[keyof PickByValue<M, key>];
  } & {
    [key in M[keyof M] as (T[keyof PickByValue<M, key>] | undefined) extends T[keyof PickByValue<M, key>] ? key : never]?: T[keyof PickByValue<M, key>];
  } & {
    [key in keyof Omit<T, keyof M>]: T[key];
  };

}

type PickByValue<T extends object, V extends T[keyof T]> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};


export {};
