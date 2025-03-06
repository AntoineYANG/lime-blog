import { put } from "@vercel/blob";


export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { url } = await put(file.name, fileBuffer, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return new Response(JSON.stringify({ url }), { status: 200 });
}
