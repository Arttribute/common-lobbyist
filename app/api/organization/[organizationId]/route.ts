// app/api/organization/[organizationId]/route.ts
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/organization/[organizationId] - Get a single organization by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await params;

    await dbConnect();

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(organization, { status: 200 });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
