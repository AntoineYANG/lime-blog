import type { UserRoleFlag } from "@lib/types";


export interface FindUserByIdPayload {
  id: string;
}

export interface FindUserByNamePayload {
  name: string;
}

export interface FindUserByEmailPayload {
  email: string;
}

export type FindUserPayload = Partial<
  FindUserByIdPayload & FindUserByNamePayload & FindUserByEmailPayload
>;

export interface FindUserResult {
  id: string;
  role: UserRoleFlag;
  name: string;
  avatar: string;
  email: string;
}
