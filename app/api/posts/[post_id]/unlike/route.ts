import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { NextResponse } from "next/server";

export interface UnLikePostRequestBody {
    userId: string;
}

export async function POST(
    request: Request,
    { params }: { params: { post_id: string } }
) {
    try {
        await connectDB(); // Ensure the DB connection is established

        const { userId }: UnLikePostRequestBody = await request.json();

        if (!params.post_id) {
            return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
        }

        const post = await Post.findById(params.post_id);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Call the unlikePost method on the post document
        await post.unlikePost(userId);

        return NextResponse.json({ message: "Post unliked successfully" });
    } catch (error) {
        console.error("Error unliking post:", error);
        return NextResponse.json(
            { error: `An error occurred while unliking the post: ${error}` },
            { status: 500 }
        );
    }
}
