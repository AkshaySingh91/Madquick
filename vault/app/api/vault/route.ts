import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import { VaultItem } from "@/models/VaultItem";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const items = await VaultItem.find({ userId: session.user.id }).sort({ createdAt: -1 });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  // Expect ciphertext and iv already encrypted on client
  const { ciphertext, iv } = body;
  if (!ciphertext || !iv) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  await connectToDatabase();
  const created = await VaultItem.create({ userId: session.user.id, ciphertext, iv });
  return NextResponse.json({ item: created });
}

