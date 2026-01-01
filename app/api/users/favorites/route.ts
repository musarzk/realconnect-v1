// app/api/users/favorites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/app/api/lib/db";
import { getAuthUser } from "@/app/api/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
    try {
        const auth = await getAuthUser();
        if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const db = await getDB();
        const users = db.collection("users");
        const properties = db.collection("properties");

        const user = await users.findOne({ _id: new ObjectId(auth.userId) });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const favoriteIds = (user.favorites || []).map((id: string) => {
            try { return new ObjectId(id); } catch { return null; }
        }).filter(Boolean);

        const favoriteProperties = await properties.find({ _id: { $in: favoriteIds } }).toArray();

        return NextResponse.json({
            success: true,
            properties: favoriteProperties.map(p => ({
                ...p,
                _id: p._id.toString(),
                agent: p.agent ? { ...p.agent, _id: p.agent._id?.toString() } : null
            }))
        });
    } catch (err: any) {
        console.error("GET /api/users/favorites error:", err);
        return NextResponse.json({ error: "Failed to load favorites" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await getAuthUser();
        if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { propertyId } = await req.json();
        if (!propertyId) return NextResponse.json({ error: "Property ID required" }, { status: 400 });

        const db = await getDB();
        const users = db.collection("users");

        const user = await users.findOne({ _id: new ObjectId(auth.userId) });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const favorites = user.favorites || [];
        const isFavorited = favorites.includes(propertyId);

        if (isFavorited) {
            // Remove
            await users.updateOne(
                { _id: new ObjectId(auth.userId) },
                { $pull: { favorites: propertyId } }
            );
        } else {
            // Add
            await users.updateOne(
                { _id: new ObjectId(auth.userId) },
                { $addToSet: { favorites: propertyId } }
            );
        }

        return NextResponse.json({
            success: true,
            isFavorited: !isFavorited,
            message: isFavorited ? "Removed from favorites" : "Added to favorites"
        });
    } catch (err: any) {
        console.error("POST /api/users/favorites error:", err);
        return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 });
    }
}
