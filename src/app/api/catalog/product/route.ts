import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/lib/types";

export async function PATCH(req: Request) {
  const { reference, updates } = await req.json();
  const catalog = await prisma.catalog.findUnique({
    where: { name: "default" },
  });
  if (!catalog) {
    return NextResponse.json({ error: "No catalog" }, { status: 404 });
  }

  const products = (catalog.products as unknown as Product[]).map((p) =>
    p.reference === reference ? { ...p, ...updates } : p
  );
  await prisma.catalog.update({
    where: { name: "default" },
    data: { products },
  });
  return NextResponse.json({ ok: true });
}
