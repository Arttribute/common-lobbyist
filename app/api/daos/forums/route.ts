// app/api/forums/route.ts
import dbConnect from "@/lib/dbConnect";
import Forum from "@/models/Forum";

import { NextResponse } from "next/server";

/**
 * GET /api/forums - Get all forums for a DAO
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const daoId = searchParams.get("daoId");
  if (!daoId) {
    return NextResponse.json(
      { error: "Missing daoId parameter" },
      { status: 400 }
    );
  }
  try {
    await dbConnect();
    const forums = await Forum.find({ daoId });
    return NextResponse.json(forums, { status: 200 });
  } catch (error) {
    console.error("Error fetching forums:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/forums - Create a new forum for a DAO
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { daoId, name, slug } = body;

    if (!daoId || !name || !slug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();
    const existingForum = await Forum.findOne({ slug });
    if (existingForum) {
      return NextResponse.json(
        { error: "Forum with this slug already exists" },
        { status: 400 }
      );
    }

    const newForum = new Forum({ daoId, name, slug });
    await newForum.save();
    return NextResponse.json(newForum, { status: 201 });
  } catch (error) {
    console.error("Error creating forum:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
