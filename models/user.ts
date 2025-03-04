
declare global {
  namespace Data {
    interface User {
      id: string;
      username: string;
      email: string;
      password: string;
    }
  }
}

export type IUser = Omit<Data.User, "password">;
