declare global {

  namespace NodeJS {

    interface ProcessEnv {
      readonly DEPLOY_HOST: string;
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
