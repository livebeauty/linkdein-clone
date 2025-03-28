
import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
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
  try {
    const post = await Post.findById(resolvedParams.post_id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.user.toString() !== authData.userId) {
      return NextResponse.json(
        { error: "You are not authorized to delete this post" },
        { status: 403 }
      );
    }

    await post.deleteOne(); // Correct way to delete a post
    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: `An error occurred while deleting the post: ${error}` },
      { status: 500 }
    );
  }
}
