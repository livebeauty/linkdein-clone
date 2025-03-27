"use server"; 

import { AddPostRequestBody } from "@/app/api/posts/route";
import { Post } from "@/mongodb/models/post";
import { currentUser } from "@clerk/nextjs/server";
import { IUser } from "@/types/user";
import generateSASToken, { containerName } from "@/lib/generateSASToken";
import { BlobServiceClient } from "@azure/storage-blob";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export default async function createPostAction(formData: FormData) {
    const user = await currentUser();

    if (!user) {
        throw new Error("User not authenticated");
    }

    const postInput = formData.get("postInput") as string;
    const image = formData.get("image") as File;
    console.log("Retrieved image:", image);

    let image_url: string | undefined = undefined;

    if (!postInput) {
        throw new Error("Post input is required");
    }

    const userDB: IUser = {
        userId: user.id,
        userImage: user.imageUrl,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
    };

    try {
        if (image && image.size > 0) {
            console.log("Uploading image to Azure Blob Storage...", image);

            const accountName = process.env.AZURE_STORAGE_NAME;
            const sasToken = await generateSASToken();

            const blobServiceClient = new BlobServiceClient(
                `https://${accountName}.blob.core.windows.net?${sasToken}`
            );

            const containerClient = blobServiceClient.getContainerClient(containerName);
            const file_name = `${randomUUID()}.png`;
            const blockBlobClient = containerClient.getBlockBlobClient(file_name);

            const imageBuffer = Buffer.from(await image.arrayBuffer());

            await blockBlobClient.uploadData(imageBuffer, {
                blobHTTPHeaders: { blobContentType: image.type },
            });

            image_url = `https://${accountName}.blob.core.windows.net/${containerName}/${file_name}`;
            console.log("File uploaded successfully:", image_url);
        }

        // Create post in database
        const body: AddPostRequestBody = {
            user: userDB,
            text: postInput,
            imageUrl: image_url ,
        };

        await Post.create(body);
    } catch (error) {
        console.error("Failed to create post", error);
        throw new Error("Post creation failed");
    }

    // Revalidate home page (App Router only)
    revalidatePath('/');
}
