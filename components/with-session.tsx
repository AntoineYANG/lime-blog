import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { FC } from "react";


export type ComponentPropsWithSession<P> = P & {
  session?: Session | null | undefined;
};

export const withSession = <P extends object>(Component: FC<P>): FC<ComponentPropsWithSession<P>> => {
  return function ComponentWithSession({ session, ...props }: ComponentPropsWithSession<P>) {
    return (
      <SessionProvider session={session}>
        <Component {...props as P} />
      </SessionProvider>
    );
  };
};
