import path from "path";
import fs from "fs-extra";
import { writeFile } from "fs/promises";
import { getServerSession } from "next-auth";
import { nanoid } from "nanoid";

import { BadPayloadErrorMessage, LoggedOutErrorMessage } from "@lib/errors";
import authOptions from "@lib/auth";
import { db, sqlite } from "@lib/drizzle";
import { type IUploadPostPayload, type IUploadPostResult, postDir } from "@lib/actions/posts";
import { posts } from "@models/post";


export async function POST(req: Request) {
  await sqlite.users.init(db);
  await sqlite.posts.init(db);
  const session = (await getServerSession(authOptions)) as null | AppSession;

  if (!session?.appUser) {
    const err = new LoggedOutErrorMessage();
    const data: IResult<IUploadPostResult> = {
      success: false,
      reason: err.label,
    };
    return new Response(JSON.stringify(data), { status: 401 });
  }

  const { title, content } = (await req.json()) as IUploadPostPayload;
  
  if (typeof title !== 'string') {
    const err = new BadPayloadErrorMessage(`Expect "title" to be "string", received "${typeof title}".`);
    const data: IResult<IUploadPostResult> = {
      success: false,
      reason: err.label,
      detail: err.details,
    };
    return new Response(JSON.stringify(data), { status: 400 });
  }

  const id = nanoid();
  const timestamp = Math.floor(Date.now() / 1_000);

  try {
    fs.ensureDirSync(postDir);
    await writeFile(path.join(postDir, `${id}.md`), content, 'utf8');
  } catch (error) {
    const err = new Error("Failed to upload post", { cause: error });
    console.error(err);
    const data: IResult<IUploadPostResult> = {
      success: false,
      reason: err.message,
    };
    return new Response(JSON.stringify(data), { status: 400 });
  }

  await db.insert(posts).values({
    id,
    authorId: session.appUser.id,
    title,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const data: IResult<IUploadPostResult> = {
    success: true,
    data: {
      id,
    },
  };

  await sqlite.posts.update(db);

  return new Response(JSON.stringify(data), { status: 201 });
}
