import { useAppSelector } from "@/stores/hook";
import { ProfileHeader } from "@/components/features/user/profile/header/profile-header";
import { AboutTab } from "@/components/features/user/profile/tabs/about/about-tab";
import { FriendsPreview } from "@/components/features/user/profile/tabs/friends/friends-preview";
import { CreatePostCard } from "@/components/features/user/profile/create-post/create-post-card";
import { PostList } from "@/components/features/user/profile/tabs/posts/post-list";
import { useUserProfile } from "@/hooks/queries/useProfileQueries";
import { useUserPosts } from "@/hooks/queries/useProfileQueries";
import { useDeletePost } from "@/hooks/queries/useProfileQueries";
import { useParams } from "react-router-dom";

export const ClientProfilePage = () => {
  const { userId = "me" } = useParams();
  const { user: currentUser } = useAppSelector((state) => state.auth);

  // Fetch profile data
  const { data: profile, isLoading: isProfileLoading } = useUserProfile(userId);

  // Fetch user posts
  const { data: postsData, isLoading: isPostsLoading } = useUserPosts(
    userId,
    1,
    10
  );

  const deletePost = useDeletePost();

  // Handle delete post
  const handleDeletePost = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost.mutateAsync({
        postId,
        userId,
      });
    }
  };

  // Format joined date
  const formatJoinedDate = (date?: string): string => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Use current user data if viewing own profile
  const displayUser = userId === "me" ? currentUser : profile;
  const isOwnProfile = userId === "me";

  const friendsCount = displayUser?.followersCount || 0;

  return (
    <div className="max-w-300 mx-auto">
      {/* Profile Header */}
      <ProfileHeader
        user={displayUser}
        isLoading={isProfileLoading}
        posts={postsData?.items}
      />

      {/* Profile Content */}
      <div className="mt-6 px-4 lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mobile Info View (visible on < lg) */}
          <div className="block lg:hidden space-y-6">
            <AboutTab
              name={displayUser?.fullName}
              bio={displayUser?.bio}
              email={displayUser?.email}
              birthday={displayUser?.dateOfBirth?.toString()}
              gender={displayUser?.gender}
              joinedDate={displayUser?.createdAt
                ? formatJoinedDate(displayUser.createdAt)
                : undefined
              }
              isLoading={isProfileLoading}
            />

            <FriendsPreview
              totalFriends={friendsCount}
              onViewAll={() => { }}
              isLoading={isProfileLoading}
            />
          </div>

          {/* Desktop Left Sidebar (1/3 width - visible on >= lg) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <AboutTab
                name={displayUser?.fullName}
                bio={displayUser?.bio}
                email={displayUser?.email}
                birthday={displayUser?.dateOfBirth?.toString()}
                gender={displayUser?.gender}
                joinedDate={displayUser?.createdAt
                  ? formatJoinedDate(displayUser.createdAt)
                  : undefined
                }
                isLoading={isProfileLoading}
              />

              <FriendsPreview
                totalFriends={friendsCount}
                onViewAll={() => { }}
                isLoading={isProfileLoading}
              />
            </div>
          </div>

          {/* Right Column - Timeline (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {isOwnProfile && <CreatePostCard />}

            <PostList
              posts={postsData?.items}
              isLoading={isPostsLoading}
              onDelete={handleDeletePost}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
