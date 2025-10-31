// app/api/forums/route.ts
import dbConnect from "@/lib/dbConnect";
import Forum from "@/models/Forum";
import Content from "@/models/Content";

import { NextResponse } from "next/server";

/**
 * GET /api/organization/forums - Get all forums for an organization
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");
  if (!organizationId) {
    return NextResponse.json(
      { error: "Missing organizationId parameter" },
      { status: 400 }
    );
  }
  try {
    await dbConnect();
    const forums = await Forum.find({ daoId: organizationId });

    // Fetch post counts and last activity for each forum
    const forumsWithStats = await Promise.all(
      forums.map(async (forum) => {
        const forumObj = forum.toObject();

        // Count posts (not comments) in this forum
        const postCount = await Content.countDocuments({
          forumId: forum._id.toString(),
          type: "post",
          status: "published",
        });

        // Get the most recent post activity
        const lastPost = await Content.findOne({
          forumId: forum._id.toString(),
          type: "post",
          status: "published",
        })
          .sort({ lastActivityAt: -1 })
          .select("lastActivityAt");

        return {
          ...forumObj,
          stats: {
            posts: postCount,
            lastActivity: lastPost?.lastActivityAt,
          },
        };
      })
    );

    return NextResponse.json(forumsWithStats || [], { status: 200 });
  } catch (error) {
    console.error("Error fetching forums:", error);
    return NextResponse.json([], { status: 200 });
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
