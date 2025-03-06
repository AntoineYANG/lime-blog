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
    }

  }
  
  type IResult<T> = {
    success: true;
    data: T;
  } | {
    success: false;
    reason: string;
    detail?: string;
  };

  type AppSession = Session & {
    accessToken?: unknown;
    appUser?: IUser | undefined | null;
  };

}

export {}
