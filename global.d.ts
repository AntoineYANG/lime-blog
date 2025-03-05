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
