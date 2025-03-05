"use client";

import { type FormEventHandler, useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { LOCAL_LOGIN_ID } from "@lib/constants";


export default function SigninPageBody() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<null | string>(null);

  const sp = useSearchParams();
  const cbUrl = sp.get("callbackUrl") || "/";
  const router = useRouter();

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(async (e) => {
    e.preventDefault();
    const result = await signIn(LOCAL_LOGIN_ID, { email, password, redirect: false });
    if (!result) {
      setError("Signin failed.");
    } else {
      if (result.error) {
        setError(result.error);
      } else {
        router.push(cbUrl);
      }
    }
  }, [email, password, router, cbUrl]);

  return (
    <div>
      <h2 className="text-center text-lg font-bold">Login</h2>
      <div className="w-full my-8 flex flex-col items-center">
        <div>
          <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            <button type="submit">Login</button>
          </form>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
};
