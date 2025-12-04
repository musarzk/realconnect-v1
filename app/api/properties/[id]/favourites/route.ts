// app/api/properties/[id]/route.ts
import { NextResponse } from "next/server";
import { getPropertiesCollection } from "@/app/api/lib/db";
import { updateProperty, deleteProperty } from "@/app/api/lib/actions/property-actions";
import { ObjectId } from "mongodb";

export async function GET(req: Request, context: any) {
  const properties = await getPropertiesCollection();
  const p = context?.params;
  const _params = typeof p?.then === "function" ? await p : p;
  const id = _params?.id;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const doc = await properties.findOne({ _id: new ObjectId(id) });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function PUT(req: Request, context: any) {
  const p = context?.params;
  const _params = typeof p?.then === "function" ? await p : p;
  const id = _params?.id;
  const body = await req.json();
  const result = await updateProperty(id, body);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: result.status || 400 });
  return NextResponse.json({ property: result.property });
}

export async function DELETE(req: Request, context: any) {
  const p = context?.params;
  const _params = typeof p?.then === "function" ? await p : p;
  const id = _params?.id;
  const result = await deleteProperty(id);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: result.status || 400 });
  return NextResponse.json({ ok: true });
}
