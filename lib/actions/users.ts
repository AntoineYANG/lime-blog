import type { IUser } from "@models/user";


export type IGetUserPayload = {
  id: string;
} | {
  name: string;
} | {
  email: string;
};

const apiGetPathname = "/api/user";

const userActions = {
  async getUser(payload: IGetUserPayload): Promise<IResult<IUser | null>> {
    const url = new URL(`${process.env.DEPLOY_HOST.replace(/\/$/, '')}${apiGetPathname}`);
    const searchParams = url.searchParams;
    if ('id' in payload) {
      searchParams.set('id', payload.id);
    }
    if ('name' in payload) {
      searchParams.set('name', payload.name);
    }
    if ('email' in payload) {
      searchParams.set('email', payload.email);
    }
    const res = await fetch(url, { method: "GET" });
    return res.json() as Promise<IResult<IUser | null>>;
  },
};


export default userActions;

