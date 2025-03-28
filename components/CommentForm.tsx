"use client";

import React, { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useUser } from "@clerk/nextjs";
import createCommentAction from "@/actions/createCommentAction";
import { toast } from "sonner";

export default function CommentForm({ postId }: { postId: string }) {
  const { user } = useUser();
  const ref = useRef<HTMLFormElement>(null);

  const createCommentActionWithPostId = createCommentAction.bind(null, postId);

  const handleCommentAction = async (formData: FormData): Promise<void> => {
    if (!user?.id) {
      console.error("User not authenticated");
      return;
    }

    try {
      await createCommentActionWithPostId(formData);
      ref.current?.reset();
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  return (
    <form ref={ref} action={(formData) => {
      const promise = handleCommentAction(formData)

       // Toast notification based on the promise above
       toast.promise(promise, {
        loading: "Creating comment...",
        success: "Comment created",
        error: "Failed to create comment",
       })
      }} className="flex items-center space-x-1">
      <Avatar>
        <AvatarImage src={user?.imageUrl || ""} />
        <AvatarFallback>
          {user?.firstName?.charAt(0)}
          {user?.lastName?.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-1 bg-white border rounded-full px-3 py-2">
        <input
          type="text"
          name="commentInput"
          placeholder="Add a comment..."
          className="outline-none flex-1 text-sm bg-transparent"
        />
        <button type="submit" hidden>
          Comment
        </button>
      </div>
    </form>
  );
}
