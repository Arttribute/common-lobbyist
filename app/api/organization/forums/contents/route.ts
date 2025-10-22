// app/api/forums/contents/route.ts
import dbConnect from "@/lib/dbConnect";
import Content from "@/models/Content";

import { NextResponse } from "next/server";

/**
 * GET /api/forums/contents - Get all all contents for a forum
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forumId = searchParams.get("forumId");
  if (!forumId) {
    return NextResponse.json(
      { error: "Missing forumId parameter" },
      { status: 400 }
    );
  }
  try {
    await dbConnect();
    // Fetch contents sorted by creation date  and then by depth (posts first, then comments) linking comments to their parents
    const contents = await Content.find({ forumId }).sort({
      createdAt: -1,
      depth: 1,
    });

    return NextResponse.json(contents, { status: 200 });
  } catch (error) {
    console.error("Error fetching contents:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organization/forums/contents - Create a new content in a forum
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { forumId, daoId, type, content, authorId, parentId } = body;

    if (!forumId || !daoId || !type || !content || !authorId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create a temporary content to get the _id
    const tempContent = new Content({
      forumId,
      daoId,
      type,
      content,
      authorId,
      parentId: parentId || null,
      depth: 0,
      rootId: "temp",
      path: "temp",
    });

    // Determine depth, rootId, and path
    let depth = 0;
    let rootId = tempContent._id.toString();
    let path = rootId;

    if (parentId) {
      const parentContent = await Content.findById(parentId);
      if (parentContent) {
        depth = parentContent.depth + 1;
        rootId = parentContent.rootId || parentId;
        path = `${parentContent.path}/${tempContent._id.toString()}`;
      }
    }

    // Update with correct values
    tempContent.depth = depth;
    tempContent.rootId = rootId;
    tempContent.path = path;

    await tempContent.save();
    return NextResponse.json(tempContent, { status: 201 });
  } catch (error) {
    console.error("Error creating content:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
