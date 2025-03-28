import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ post_id: string }> } // Update type to reflect Promise
) {
  await connectDB();

  const resolvedParams = await params; 

  try {
    const post = await Post.findById(resolvedParams.post_id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ likes: post.likes });
  } catch (error) {
    return NextResponse.json(
      { error: `An error occurred while fetching likes: ${error}` },
      { status: 500 }
    );
  }
}

export interface LikePostRequestBody {
  userId: string;
}

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ post_id: string }> }
) {
  const authData = await auth();

  if (!authData.userId) {
    return NextResponse.json(
      { error: "Unauthorized access" },
      { status: 401 }
    );
  }

  await connectDB();

  const resolvedParams = await params; 
  const { userId }: LikePostRequestBody = await request.json();

  try {
    const post = await Post.findById(resolvedParams.post_id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await post.likePost(userId);
    return NextResponse.json({ message: "Post liked successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: `An error occurred while liking the post: ${error}` },
      { status: 500 }
    );
  }
}