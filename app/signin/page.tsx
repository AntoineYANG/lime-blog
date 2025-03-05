"use client";

import { Suspense } from "react";

import SigninPageBody from "./body";


export default function SigninPage() {
  return (
    <Suspense>
      <SigninPageBody />
    </Suspense>
  );
};
