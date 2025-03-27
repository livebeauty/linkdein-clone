import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { IUser } from "@/types/user";
import { ICommentBase } from "@/mongodb/models/comment";

// Define the response type for GET (optional but improves type safety)
interface GetCommentsResponse {
  comments: ICommentBase[];
}

// Fetch comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { post_id: string } }
) {
  try {
    await connectDB();
    const post = await Post.findById(params.post_id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comments = await post.getAllComments();
    return NextResponse.json({ comments } as GetCommentsResponse);
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

// Define the request body type for POST
export interface AddCommentRequestBody {
  user: IUser;
  text: string;
}

// Add a comment to a post
export async function POST(
  request: NextRequest,
  { params }: { params: { post_id: string } }
) {
  try {
    await connectDB();
    const { user, text }: AddCommentRequestBody = await request.json();

    // Validate request body
    if (!user || !text) {
      return NextResponse.json(
        { error: "User and text are required" },
        { status: 400 }
      );
    }

    const post = await Post.findById(params.post_id);
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