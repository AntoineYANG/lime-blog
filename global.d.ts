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
  };

}

export {}
