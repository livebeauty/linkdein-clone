import mongoose, { Schema, Document, Model, models, Types } from "mongoose";
import { Comment, IComment, ICommentBase } from "./comment"; // Ensure Comment model is imported
import { IUser } from "@/types/user";

export interface IPostBase {
  user: IUser;
  text: string;
  imageUrl?: string;
  comments?: IComment[]// ✅ Fix: Explicitly define comment IDs as ObjectId
  likes?: string[];
}

export interface IPost extends IPostBase, Document {
  _id: Types.ObjectId; // ✅ Fix: Explicitly define _id type
  createdAt: Date;
  updatedAt: Date;
}

interface IPostMethods {
  likePost(userId: string): Promise<void>;
  unlikePost(userId: string): Promise<void>;
  commentOnPost(comment: ICommentBase): Promise<void>;
  getAllComments(): Promise<IComment[]>;
  removePost(): Promise<void>;
}

interface IPostStatics {
  getAllPosts(): Promise<IPostDocument[]>;
}

export interface IPostDocument extends IPost, IPostMethods {}

interface IPostModel extends IPostStatics, Model<IPostDocument> {}

const postSchema = new Schema<IPostDocument>(
  {
    user: {
      userId: { type: String, required: true },
      userImage: { type: String, required: true },
      firstName: { type: String, required: true },
      lastname: { type: String },
    },
    text: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    comments: { type: [Schema.Types.ObjectId], ref: "Comment" }, // ✅ Ensure proper structure
    likes: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

postSchema.methods.likePost = async function (userId: string) {
  try {
    await this.updateOne({ $addToSet: { likes: userId } });
  } catch (error) {
    console.error(`Error when liking the post: ${error}`);
    throw new Error("Failed to like post");
  }
};


postSchema.methods.unlikePost = async function (userId: string) {
  try {
    await this.updateOne({ $pull: { likes: userId } });
  } catch (error) {
    console.error(`Error when unliking the post: ${error}`);
    throw new Error("Failed to unlike post");
  }
};


postSchema.methods.removePost = async function () {
  try {
    await this.model("Post").deleteOne({ _id: this._id });
  } catch (error) {
    console.log(`Error when deleting the post: ${error}`);
  }
};

postSchema.methods.commentOnPost = async function (commentToAdd: ICommentBase) {
  try {
    const comment = await Comment.create(commentToAdd);
    this.comments.push(comment._id); 
    await this.save();
  } catch (error) {
    console.log(`Error when commenting on the post: ${error}`);
  }
};

postSchema.methods.getAllComments = async function () {
  try {
    await this.populate({
      path: "comments",
      options: { sort: { createdAt: -1 } },
    });
    return this.comments as IComment[];;
  } catch (error) {
    console.log(`Error when fetching all comments: ${error}`);
  }
};


postSchema.statics.getAllPosts = async function () {
  try {
    const posts = await this.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "comments",
        // model: Comment, 
        options: { sort: { createdAt: -1 } },
      })
      .lean();

    return posts.map((post: IPostDocument) => ({
      ...post,
      _id: post._id.toString(),
      comments: (post.comments as unknown as IComment[])?.map((comment: IComment) => ({
        ...comment,
        _id: comment._id.toString(), 
      })),
    }));
  } catch (error) {
    console.log("Error when getting all posts", error);
    return [];
  }
};



// Register model
export const Post =
  (models.Post as IPostModel) ||
  mongoose.model<IPostDocument, IPostModel>("Post", postSchema);
