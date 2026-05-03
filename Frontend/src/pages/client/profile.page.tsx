import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useAppSelector } from "@/stores/hook";
import { ProfileHeader } from "@/components/features/user/profile/header/profile-header";
import { TabNavigation } from "@/components/features/user/profile/navigation/tab-navigation";
import { AboutTab } from "@/components/features/user/profile/tabs/about/about-tab";
import { FriendsTab } from "@/components/features/user/profile/tabs/friends/friends-tab";
import { FriendsPreview } from "@/components/features/user/profile/tabs/friends/friends-preview";
import { ImagesPreview } from "@/components/features/user/profile/tabs/media/images-preview";
import { CreatePostCard } from "@/components/features/user/profile/create-post/create-post-card";
import { PostList } from "@/components/features/user/profile/tabs/posts/post-list";
import { flattenMediaFromPosts } from "@/services/post/dtos/helpers/post-helpers";
import { useUserProfile } from "@/hooks/queries/useProfileQueries";
import { useUserPosts } from "@/hooks/queries/useProfileQueries";
import { useDeletePost } from "@/hooks/queries/useProfileQueries";
import { MediaGallery } from "@/components/features/user/profile/tabs/media/media-gallery";

export const ClientProfilePage = () => {
  const { userId = "me" } = useParams();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState(userId);
  const [activeTab, setActiveTab] = useState("posts");

  // Fetch profile data
  const { data: profile, isLoading: isProfileLoading } = useUserProfile(selectedUserId);
  
  // Fetch user posts with race condition protection
  const { data: postsData, isLoading: isPostsLoading } = useUserPosts(
    selectedUserId,
    1,
    10
  );

  const deletePost = useDeletePost();

  // Handle delete post
  const handleDeletePost = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost.mutateAsync({
        postId,
        userId: selectedUserId,
      });
    }
  };

  // Prepare media gallery items from posts
  const mediaItems = flattenMediaFromPosts(postsData?.items || []);

  // Format joined date
  const formatJoinedDate = (date?: string): string => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Race condition protection: Cancel queries when userId changes
  useEffect(() => {
    if (userId !== selectedUserId) {
      setSelectedUserId(userId);
    }

    return () => {
      // Cancel all queries for previous userId
      queryClient.cancelQueries({
        queryKey: ["profile", selectedUserId],
      });
      queryClient.cancelQueries({
        queryKey: ["posts", selectedUserId],
      });
    };
  }, [userId, selectedUserId, queryClient]);

  // Use current user data if viewing own profile
  const displayUser = userId === "me" ? currentUser : profile;
  const isOwnProfile = userId === "me";

  // Calculate counts for tabs
  const postsCount = postsData?.totalCount || 0;
  const friendsCount = displayUser?.followersCount || 0;
  const photosCount = mediaItems.filter(item => item.mediaType !== 'video').length;
  const videosCount = mediaItems.filter(item => item.mediaType === 'video').length;

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Profile Header */}
      <ProfileHeader
        user={displayUser}
        isLoading={isProfileLoading}
        posts={postsData?.items}
      />

      {/* Tab Navigation */}
      <TabNavigation
        value={activeTab}
        onValueChange={setActiveTab}
        postsCount={postsCount}
        friendsCount={friendsCount}
        photosCount={photosCount}
        videosCount={videosCount}
      />

      {/* Content based on active tab */}
      <div className="mt-6 px-4 lg:px-0">
        {activeTab === "posts" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Sidebar - Sticky (40% width) */}
            <div className="hidden lg:block lg:col-span-2">
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

                <ImagesPreview
                  images={mediaItems.filter(item => item.mediaType !== 'video').map((item, i) => ({ id: `${i}`, url: item.mediaUrl }))}
                  totalImages={photosCount}
                  onViewAll={() => setActiveTab("photos")}
                  isLoading={isPostsLoading}
                />
                
                <FriendsPreview
                  totalFriends={friendsCount}
                  onViewAll={() => setActiveTab("friends")}
                  isLoading={isProfileLoading}
                />

              </div>
            </div>

            {/* Right Column - Timeline (60% width) */}
            <div className="lg:col-span-3 space-y-6">
              {isOwnProfile && <CreatePostCard />}
              
              <PostList
                posts={postsData?.items}
                isLoading={isPostsLoading}
                onDelete={handleDeletePost}
              />
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="max-w-2xl mx-auto">
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
          </div>
        )}

        {activeTab === "friends" && (
          <div className="max-w-4xl mx-auto">
            <FriendsTab
              friends={[]}
              isLoading={isProfileLoading}
              isOwnProfile={isOwnProfile}
            />
          </div>
        )}

        {activeTab === "photos" && (
          <div className="max-w-4xl mx-auto">
            <MediaGallery
              items={mediaItems}
              isLoading={isPostsLoading}
              mediaType="image"
            />
          </div>
        )}

        {activeTab === "videos" && (
          <div className="max-w-4xl mx-auto">
            <MediaGallery
              items={mediaItems}
              isLoading={isPostsLoading}
              mediaType="video"
            />
          </div>
        )}
      </div>
    </div>
  );
};