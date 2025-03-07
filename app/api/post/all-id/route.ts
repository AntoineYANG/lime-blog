import { setupGetHandler } from "@lib/utils";
import Post from "@actions/post";


export const GET = setupGetHandler(Post.listPostId);
