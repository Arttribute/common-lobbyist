import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find().sort({
      createdAt: -1,
    });
    return new NextResponse(JSON.stringify(users), {
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return new NextResponse(errorMessage, {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, name, onchain_address } = await request.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new NextResponse(JSON.stringify(existingUser), {
        status: 200,
      });
    }

    const user = await User.create({
      email,
      name,
      onchain_address,
    });

    return new NextResponse(JSON.stringify(user), {
      status: 201,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return new NextResponse(errorMessage, {
      status: 500,
    });
  }
}
