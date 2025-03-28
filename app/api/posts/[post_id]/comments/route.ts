import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { IUser } from "@/types/user";
import { ICommentBase } from "@/mongodb/models/comment";

// ✅ GET: Fetch comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ post_id: string }>}
) {
  await connectDB();

  const resolvedParams = await params; 

    try {
    const post = await Post.findById(resolvedParams.post_id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comments = await post.getAllComments();
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json(
      {
        error: `An error occurred while fetching comments: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 }
    );
  }
}


export interface AddCommentRequestBody {
  user: IUser;
  text: string;
}


export async function POST(
   request: NextRequest, 
  { params }: { params: Promise<{ post_id: string }> }
) {
  await connectDB();

 
  const resolvedParams = await params; 
    const { user, text }: AddCommentRequestBody = await request.json();
    try {
    const post = await Post.findById(resolvedParams.post_id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment: ICommentBase = { user, text };
    await post.commentOnPost(comment);

    return NextResponse.json({ message: "Comment added successfully" });
  } catch (error) {
    return NextResponse.json(
      {
        error: `An error occurred while commenting on the post: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 }
    );
  }
}
