// app/api/daos/route.ts
import dbConnect from "@/lib/dbConnect";
import Dao from "@/models/Dao";

import { NextResponse } from "next/server";

/**
 * GET /api/daos - Get all DAOs
 */
export async function GET() {
  try {
    await dbConnect();
    const daos = await Dao.find({});
    return NextResponse.json(daos, { status: 200 });
  } catch (error) {
    console.error("Error fetching DAOs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/daos - Create a new DAO
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();
    const existingDao = await Dao.findOne({ slug });
    if (existingDao) {
      return NextResponse.json(
        { error: "DAO with this slug already exists" },
        { status: 400 }
      );
    }

    const newDao = new Dao({ name, slug });
    await newDao.save();
    return NextResponse.json(newDao, { status: 201 });
  } catch (error) {
    console.error("Error creating DAO:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
