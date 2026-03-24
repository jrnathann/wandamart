import { uploadToCloudinary } from "@/lib/UploadCloudinary";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileBase64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  const url = await uploadToCloudinary(fileBase64, "branding");
  return NextResponse.json({ url });
}