import { setupPostHandler } from "@lib/utils";
import Post from "@actions/post";


export const POST = setupPostHandler(Post.newPost, 201);
