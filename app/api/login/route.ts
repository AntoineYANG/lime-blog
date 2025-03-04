import { authCredentials } from "@lib/db";
import type { IUser } from "@models/user";


export interface ICredentialsLoginPayload {
  email: string;
  password: string;
}

export async function POST(req: Request) {
  const data = await req.json() as ICredentialsLoginPayload;
  // const prepared = await connection.prepare('SELECT * FROM users WHERE email = $1 and password = $2');
  // prepared.bindVarchar(1, data.email);
  // prepared.bindVarchar(2, data.password);
  // const reader = await prepared.runAndReadAll();
  // const rows = reader.getRows();
  // console.log({rows});

  const user = await authCredentials(data.email, data.password);

  const res: IResult<IUser> = user ? {
    success: true,
    data: user,
  } : {
    success: false,
    reason: 'Login failed.',
  };
  
  return new Response(JSON.stringify(res), { status: 200 });
}
