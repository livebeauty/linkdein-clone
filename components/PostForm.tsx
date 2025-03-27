"use client";

import { AvatarImage } from "@radix-ui/react-avatar";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { ImageIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import Image from "next/image";
import createPostAction from "@/actions/createPostAction";
import { toast } from "sonner";

const PostForm = () => {
  const { user } = useUser();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handlePostAction = async (formData: FormData) => {
    if (loading) return; 
    setLoading(true);

    const formDataCopy= formData;
    formRef.current?.reset()

    const text = formDataCopy.get("postInput") as string;
    if (!text.trim()) {
      alert("You must provide a post input");
      setLoading(false);
      return;
    }
    setPreview(null)

    try {
      await createPostAction(formData);
      formRef.current?.reset();
      setPreview(null);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="mb-4">
      <form
        ref={formRef}
        action={(formData) => {
        // Handle form submission with server action
         const promise =   handlePostAction(formData)

        // Toast notification based on the promise above
         toast.promise(promise, {
          loading: "Created post...",
          success: "Post created successfully",
          error: "Failed to create post"
         })
        
        }}
        className="p-4 bg-white rounded-lg border"
      >
        <div className="flex items-center space-x-3">
          {/* User Avatar */}
          <Avatar>
            <AvatarImage src={user?.imageUrl} alt="User Avatar" />
            <AvatarFallback>
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Post Input */}
          <input
            type="text"
            name="postInput"
            placeholder="Start writing a post..."
            className="flex-1 outline-none rounded-full py-3 px-4 border"
            required
          />

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />

          <Button type="submit" hidden>
            Post
          </Button>
        </div>

        {/* Image Preview */}
        {preview && (
          <div className="mt-3">
            <Image
              src={preview}
              alt="Post Preview"
              width={500}
              height={300}
              className="w-full object-cover rounded-lg"
            />
          </div>
        )}

            {/* Buttons */}
            <div className="mt-2 flex justify-end space-x-2">
              <Button type="button" variant={preview ? "secondary" : "outline"} onClick={() => fileInputRef.current?.click()}>
                <ImageIcon className="mr-2" size={16} color="currentColor" />
                {preview ? "Change" : "Add"} Image
              </Button>

             {preview && (
                 <Button type="button" variant="outline" onClick={() => setPreview(null)}>
                 <XIcon className="mr-2" size={16} color="currentColor" />
                 Remove image
               </Button>
             )}
              
            </div>
      </form>
       <hr className="mt-2 border-gray-300"/>
    </div>
  );
};

export default PostForm;
