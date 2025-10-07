import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import { VaultItem } from "@/models/VaultItem";

interface Params {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = params;
  const { ciphertext, iv } = await req.json();
  if (!ciphertext || !iv) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  await connectToDatabase();
  const updated = await VaultItem.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { ciphertext, iv },
    { new: true }
  );
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item: updated });
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = params;
  await connectToDatabase();
  const res = await VaultItem.findOneAndDelete({ _id: id, userId: session.user.id });
  if (!res) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}

