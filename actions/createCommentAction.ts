"use server";

import { revalidatePath } from "next/cache";
import { ICommentBase } from "@/mongodb/models/comment";
import { IUser } from "@/types/user";
import { currentUser } from "@clerk/nextjs/server";
import { Post } from "@/mongodb/models/post";

export default async function createCommentAction(postId: string, formData: FormData) {
  const user = await currentUser();
  const commentInput = formData.get("commentInput") as string;

  if (!postId) throw new Error("Post Id is required");
  if (!commentInput) throw new Error("Comment input is required");
  if (!user?.id) throw new Error("User not authenticated");

  const userDB: IUser = {
    userId: user.id,
    userImage: user.imageUrl || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
  };

  const post = await Post.findById(postId);
  if (!post) {
    throw new Error("Post Not Found");
  }

  const comment: ICommentBase = {
    user: userDB,
    text: commentInput,
  };

  try {
    await post.commentOnPost(comment);
    revalidatePath("/");
  } catch (error) {
    throw new Error(`An error occurred while adding a comment: ${error}`);
  }
}
