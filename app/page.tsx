import PostList from "@cp/post-list";
import Post from "@actions/post";


export default async function Home() {
  try {
    const data = await Post.listPost.call();
  
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
