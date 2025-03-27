"use client";

import { IPostDocument } from "@/mongodb/models/post";
import { SignedIn, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { MessageCircle, Repeat2, Send, ThumbsUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import CommentFeed from "./CommentFeed";
import CommentForm from "./CommentForm";
import { toast } from "sonner";

export default function PostOption({ post }: { post: IPostDocument }) {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const { user } = useUser();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState<string[]>(post.likes ?? []);

  useEffect(() => {
    if (user?.id && post.likes?.includes(user.id)) {
      setLiked(true);
    }
  }, [post, user]);

  const likeOrUnlikePost = async () => {
    if (!user?.id) {
      console.error("User not authenticated");
      return;
    }

    const originalLiked = liked;
    const originalLikes = likes;

    const newLikes = liked
      ? likes.filter((like) => like !== user.id)
      : [...likes, user.id];

    setLiked(!liked);
    setLikes(newLikes);

    try {
      const response = await fetch(`/api/posts/${post._id.toString()}/${liked ? "unlike" : "like"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        setLiked(originalLiked);
        setLikes(originalLikes);
        toast.error("Failed to like or unlike post")
        throw new Error(`Failed to ${liked ? "unlike" : "like"} post: ${response.statusText}`);
      }

      const newLikesData = await response.json();
      setLikes(newLikesData.likes);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex justify-between p-4">
        {likes.length > 0 && <p className="text-xs text-gray-500">{likes.length} likes</p>}
        {post.comments?.length ? (
          <p onClick={() => setIsCommentOpen(!isCommentOpen)} className="text-xs text-gray-500 cursor-pointer hover:underline">
            {post.comments.length} comments
          </p>
        ) : null}
      </div>

      <div className="flex p-2 justify-between px-2 border-t">
        <Button variant="ghost" className="postButton" onClick={() => {
          const promise = likeOrUnlikePost()
          
          toast.promise(promise,{
            loading: liked ? "Unliking post..." : "Liking post...",
            success: liked ? "Post Unliked" : "Post Liked",
            error: "Failed to update like status",
          })
          }} disabled={!user}>
          <ThumbsUpIcon className={cn("mr-1", liked && "text-[#4881c2] fill-[#4881c2]")} />
          Like
        </Button>

        <Button variant="ghost" className="postButton" onClick={() => setIsCommentOpen(!isCommentOpen)}>
          <MessageCircle className={cn("mr-1", isCommentOpen && "text-gray-600 fill-gray-600")} />
          Comments
        </Button>

        <Button variant="ghost" className="postButton">
          <Repeat2 className="mr-1" />
          Repost
        </Button>

        <Button variant="ghost" className="postButton">
          <Send className="mr-1" />
          Send
        </Button>
      </div>

      {isCommentOpen && (
        <div className="p-4">
          <SignedIn>
            <CommentForm postId={post._id.toString()} />
          </SignedIn>
          <CommentFeed post={post} />
        </div>
      )}
    </div>
  );
}
