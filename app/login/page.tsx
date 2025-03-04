"use client";

import { type FormEventHandler, useCallback, useState } from "react";
import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<null | string>(null);
  // const router = useRouter();

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(async (e) => {
    e.preventDefault();
    const result = await signIn("credentials", { email, password, redirect: false });
    if (!result) {
      setError("Signin failed.");
    } else {
      if (result.error) {
        setError(result.error);
      } else {
        // TODO: redirect if needed
        // router.push("/");
      }
    }
  }, [email, password]);

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};
