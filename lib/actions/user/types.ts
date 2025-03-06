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

export interface FindUserRespond {
  id: string;
  name: string;
  avatar: string;
  email: string;
}
