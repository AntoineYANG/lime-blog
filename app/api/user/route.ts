import type { NextRequest } from "next/server";
import { and, eq, isNull, type SQL } from "drizzle-orm";

import { db, sqlite } from "@lib/drizzle";
import { users, type IUser } from "@models/user";
import { BadPayloadErrorMessage, raiseErrorMessage } from "@/lib/errors";


export async function GET(req: NextRequest) {
  await sqlite.users.init(db);

  const searchParams = req.nextUrl.searchParams;
  let where: SQL<unknown>;
  const id = searchParams.get("id");
  const name = searchParams.get("name");
  const email = searchParams.get("email");
  if (id) {
    where = eq(users.id, id);
  } else if (name) {
    where = eq(users.username, name);
  } else if (email) {
    where = eq(users.email, email);
  } else {
    const err = raiseErrorMessage(new BadPayloadErrorMessage("One of \"id\" \"name\" \"email\" is needed."));
    const data: IResult<IUser | null> = {
      success: false,
      reason: err.message,
    };
    return new Response(JSON.stringify(data), { status: 400 });
  }

  const value = await db.query.users.findFirst({
    where: and(isNull(users.deleted_at), where),
  });

  const user: IUser | null = value ? {
    id: value.id,
    role: value.role,
    username: value.username,
    email: value.email,
    avatar: value.avatar,
    created_at: value.created_at,
  } : null;

  const data: IResult<IUser | null> = {
    success: true,
    data: user ?? null,
  };

  return new Response(JSON.stringify(data), { status: 200 });
}
