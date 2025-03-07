import { setupGetHandler } from "@lib/utils";
import User from "@actions/user";


export const GET = setupGetHandler(User.findUser);
