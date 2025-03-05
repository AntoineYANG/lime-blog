// import Link from "next/link";

import PostList from "@/components/post-list";
import postActions from "@lib/actions/posts";


export default async function Home() {
  try {
    const data = await postActions.fetchPostList({});
  
    return (
      <div>
        {data.success && (
          <PostList items={data.data.items} />
        )}
      </div>
    );
  } catch {
    return (
      <div></div>
    );
  }
}
