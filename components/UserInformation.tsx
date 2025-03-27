import { currentUser } from "@clerk/nextjs/server";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { IPostDocument } from "@/mongodb/models/post";

const UserInformation = async ({posts}: {posts: IPostDocument[]}) => {
  const user = await currentUser();

  const firstname = user?.firstName;
  const lastName = user?.lastName;
  const imageUrl = user?.imageUrl

  const userPosts = posts.filter((post) => post.user.userId === user?.id)

  const userComments = posts.flatMap((post) =>
    post?.comments?.filter((comment) => comment.user.userId === user?.id) || []);
  return (
    <div className="flex flex-col items-center bg-white shadow-sm rounded-lg border py-6 px-4 w-[300px]">
      {/* Profile Avatar */}
      <Avatar className="w-20 h-20">
        {user?.id ? (
          <AvatarImage src={imageUrl} />
        ) : (
          <AvatarImage src="https://github.com/shadcn.png" />
        )}
        <AvatarFallback>
          {firstname?.charAt(0)}
          {lastName?.charAt(0)}
        </AvatarFallback>
      </Avatar>

      {/* User Information */}
      <SignedIn>
        <div className="text-center mt-3">
          <p className="text-lg font-semibold">{firstname} {lastName}</p>
          <p className="text-xs text-gray-500">
            @{firstname}{lastName}-{user?.id.slice(-4)}
          </p>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="text-center space-y-2">
          <p className="font-semibold">You are not signed in</p>
          <Button asChild className="bg-[#0B63C4] text-white w-full">
            <SignInButton>Sign in</SignInButton>
          </Button>
        </div>
      </SignedOut>

      {/* Divider */}
      <SignedIn>
      <hr className="w-full border-gray-300 my-4" />

      {/* Stats Section (LinkedIn Style) */}
      <div className="w-full space-y-2 text-sm">

        <div className="flex justify-between text-gray-500 hover:bg-gray-100 py-2 px-3 rounded-md cursor-pointer">
          <p className="font-medium">Posts</p>
          <p className="text-blue-600 font-semibold">{userPosts.length}</p>
        </div>

        <div className="flex justify-between text-gray-500 hover:bg-gray-100 py-2 px-3 rounded-md cursor-pointer">
          <p className="font-medium">Comments</p>
          <p className="text-blue-600 font-semibold">{userComments.length}</p>
        </div>
      </div>
      </SignedIn>
    </div>
  );
};

export default UserInformation;
