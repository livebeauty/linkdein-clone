"use client";

import { IPostDocument } from "@/mongodb/models/post";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import deletePostAction from "@/actions/deletePostAction";
import Image from "next/image";
import PostOption from "./PostOption";
import ClientTimeAgo from "./ClientTimeAgo";
import { toast } from "sonner";

export default function Post({ post }: { post: IPostDocument }) {
  const { user } = useUser();
  const isAuthor = user?.id === post.user.userId;

  return (
    <div className="bg-white rounded-md border">
      <div className="p-4 flex space-x-2">
        <Avatar>
          <AvatarImage src={post.user.userImage} />
          <AvatarFallback>
            {post.user.firstName?.charAt(0)}
            {post.user.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex justify-between flex-1">
          <div>
            <p className="font-semibold">
              {post.user.firstName} {post.user.lastName}{" "}
              {isAuthor && <Badge className="ml-2" variant="secondary">Author</Badge>}
            </p>

            <p className="text-xs text-gray-400">
              @{post.user.firstName}-{post.user.userId.toString().slice(-4)}
            </p>

            <p className="text-xs text-gray-400">
                  <ClientTimeAgo date={new Date(post.createdAt)} />
             </p>

          </div>

          {isAuthor && (
            <Button
              variant="outline"
              onClick={() => {
                const promise = deletePostAction(post._id.toString());
                // Toast notification (if applicable)
                // Toast notification based on the promise above
                toast.promise(promise, {
                loading: "Deleting post...",
                success: "Post deleted",
                error: "Failed to delete post"
                })
              }}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </div>

      <div>
        <p>{post.text}</p>

        {/* If an image is uploaded, display it */}
        {post.imageUrl && (
          <Image
            src={post.imageUrl}
            alt="Post image"
            width={500}
            height={500}
            className="w-full mx-auto"
          />
        )}
      </div>

      {/* Post Options */}
      <PostOption post={post} />
    </div>
  );
}
