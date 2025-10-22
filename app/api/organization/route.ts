// app/api/daos/route.ts
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";

import { NextResponse } from "next/server";

/**
 * GET /api/daos - Get all DAOs
 */
export async function GET() {
  try {
    await dbConnect();
    const organizations = await Organization.find({});
    return NextResponse.json(organizations, { status: 200 });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organization - Create a new organization
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, onchain } = body;

    if (!name || !onchain?.chainId || !onchain?.factory || !onchain?.registry || !onchain?.token) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    const newOrganization = new Organization({
      name,
      description,
      onchain: {
        chainId: onchain.chainId,
        factory: onchain.factory,
        registry: onchain.registry,
        token: onchain.token,
      }
    });
    await newOrganization.save();
    return NextResponse.json(newOrganization, { status: 201 });
  } catch (error) {
    console.error("Error creating Organization:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
