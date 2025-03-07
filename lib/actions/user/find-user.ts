import { and, eq, isNull, SQL } from "drizzle-orm";

import { subscribeRequestHandler } from "@lib/utils";
import { BadPayloadErrorMessage, raiseErrorMessage } from "@lib/errors";
import { db } from "@lib/drizzle";
import { ensureUserTable, users } from "@models/user";
import type { FindUserPayload, FindUserRespond } from "./types";


const findUser = subscribeRequestHandler({
  endpoint: "/user",
  name: "findUser",
  async execute(payload: FindUserPayload): Promise<FindUserRespond | null> {
    let where: SQL<unknown>;
    
    const { id, name, email } = payload;
    if (id) {
      where = eq(users.id, id);
    } else if (name) {
      where = eq(users.username, name);
    } else if (email) {
      where = eq(users.email, email);
    } else {
      const err = raiseErrorMessage(new BadPayloadErrorMessage("One of \"id\" \"name\" \"email\" is needed."));
      throw err;
    }
    
    await ensureUserTable(db);
    const value = await db.query.users.findFirst({
      where: and(isNull(users.deletedAt), where),
    });

    if (!value) {
      return null;
    }
    
    return {
      id: value.id,
      name: value.username,
      email: value.email,
      avatar: value.avatar,
    };
  },
  onError(error) {
    if (error && error instanceof Error) {
      const err = error.cause;
      if (err && typeof err === "object" && err instanceof BadPayloadErrorMessage) {
        return {
          success: false,
          reason: `${err.label}: ${err.details}`,
        };
      }
    }
  },
});

export default findUser;
