export const LOCAL_LOGIN_ID = "local-login";

export enum OrderDirection {
  DESC = 0,
  ASC = 1,
}

export const validOrderDirection = [
  OrderDirection.DESC,
  OrderDirection.ASC,
] as const;

export const validOrderByKey = [
  "created time",
  "updated time",
] as const;
