"use client";

import { type FC, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@cp/button.client";
import { ErrorMessage } from "@/lib/errors";


const NewPostPage: FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    const url = new URL("/api/post/new", window.location.href);
    const r = await fetch(url, { method: "post", body: JSON.stringify({ title, content }) });
    const res = await r.json();
    if (res.success === false) {
      console.log(res)
      if (res.reason instanceof ErrorMessage) {
        alert(`${(res.reason as ErrorMessage).label}. ${(res.reason as ErrorMessage).details}`);
      } else {
        alert(res.reason);
      }
    } else {
      router.push(`/p/${res.data.id}`);
    }
  };

  return (
    <div>
      <h1>New Blog</h1>
      <div className="mx-8 my-4 flex flex-col items-center">
        <form className="flex-none max-w-3xl w-[80vw] mx-auto flex flex-col items-center px-2 space-y-4">
          <div className="flex-none w-full flex items-baseline justify-items-start space-x-2">
            <label className="flex-none">Title:</label>
            <input type="text" className="flex-1" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="flex-none w-full flex items-baseline justify-items-start space-x-2">
            <textarea className="flex-none w-full min-h-[60vh] h-full px-4 py-6 resize-none" value={content} onChange={(e) => setContent(e.target.value)} required />
          </div>
          <div className="flex-none w-full flex items-baseline justify-items-center space-x-2">
            <Button onTrigger={handleSubmit} disabled={!title}>Submit</Button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default NewPostPage;
