import { useMemo } from "react";
import { useAppSelector } from "@/stores/hook";
import { ProfileHeader } from "@/components/features/user/profile/header/profile-header";
import { TabNavigation } from "@/components/features/user/profile/navigation/tab-navigation";
import { AboutTab } from "@/components/features/user/profile/tabs/about/about-tab";
import { FriendsTab } from "@/components/features/user/profile/tabs/friends/friends-tab";
import { FriendsPreview } from "@/components/features/user/profile/tabs/friends/friends-preview";
import { ImagesPreview } from "@/components/features/user/profile/tabs/media/images-preview";
import { MediaGallery } from "@/components/features/user/profile/tabs/media/media-gallery";
import { CreatePostCard } from "@/components/features/user/profile/create-post/create-post-card";
import { PostList } from "@/components/features/user/profile/tabs/posts/post-list";
import { useUserProfile, useUserPosts, useDeletePost } from "@/hooks/queries/useProfileQueries";
import { useParams, useSearchParams } from "react-router-dom";

export const ClientProfilePage = () => {
  const { userId = "me" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const activeTab = searchParams.get("tab") || "posts";

  const handleTabChange = (newTab: string) => {
    if (newTab === "posts") {
      setSearchParams({}, { replace: false });
    } else {
      setSearchParams({ tab: newTab }, { replace: false });
    }
  };

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

  // Extract media items from posts (including postId)
  const allMediaItems = useMemo(() => {
    if (!postsData?.items) return [];
    const items: Array<{
      id: string;
      mediaUrl: string;
      likes: number;
      comments: number;
      mediaType: "image" | "video";
      postId: string;
    }> = [];

    postsData.items.forEach((post) => {
      post.mediaItems?.forEach((m) => {
        items.push({
          id: m.id,
          mediaUrl: m.url,
          likes: post.reactionCount || 0,
          comments: post.commentCount || 0,
          mediaType: m.mediaType.toLowerCase() as "image" | "video",
          postId: post.id,
        });
      });
    });

    return items;
  }, [postsData?.items]);

  const photos = useMemo(
    () => allMediaItems.filter((m) => m.mediaType === "image"),
    [allMediaItems]
  );
  const videos = useMemo(
    () => allMediaItems.filter((m) => m.mediaType === "video"),
    [allMediaItems]
  );

  const previewPhotos = useMemo(
    () => photos.map((p) => ({ id: p.id, url: p.mediaUrl, postId: p.postId })),
    [photos]
  );

  const postsCount = postsData?.totalCount || postsData?.items?.length || 0;
  const friendsCount = displayUser?.followersCount || 0;
  const photosCount = photos.length;
  const videosCount = videos.length;

  return (
    <div className="max-w-300 mx-auto">
      {/* Profile Header */}
      <ProfileHeader
        user={displayUser}
        isLoading={isProfileLoading}
        posts={postsData?.items}
      />

      {/* Tab Navigation */}
      <TabNavigation
        value={activeTab}
        onValueChange={handleTabChange}
        postsCount={postsCount}
        friendsCount={friendsCount}
        photosCount={photosCount}
        videosCount={videosCount}
      />

      {/* Profile Content */}
      <div className="mt-6 px-4 lg:px-0">
        {activeTab === "posts" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mobile Info View (visible on < lg) */}
            <div className="block lg:hidden space-y-6">
              <AboutTab
                name={displayUser?.fullName}
                bio={displayUser?.bio}
                email={displayUser?.email}
                birthday={displayUser?.dateOfBirth?.toString()}
                gender={displayUser?.gender}
                joinedDate={
                  displayUser?.createdAt
                    ? formatJoinedDate(displayUser.createdAt)
                    : undefined
                }
                isLoading={isProfileLoading}
              />

              <FriendsPreview
                totalFriends={friendsCount}
                onViewAll={() => handleTabChange("friends")}
                isLoading={isProfileLoading}
              />

              <ImagesPreview
                images={previewPhotos}
                totalImages={photosCount}
                onViewAll={() => handleTabChange("photos")}
                isLoading={isPostsLoading}
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
                  joinedDate={
                    displayUser?.createdAt
                      ? formatJoinedDate(displayUser.createdAt)
                      : undefined
                  }
                  isLoading={isProfileLoading}
                />

                <FriendsPreview
                  totalFriends={friendsCount}
                  onViewAll={() => handleTabChange("friends")}
                  isLoading={isProfileLoading}
                />

                <ImagesPreview
                  images={previewPhotos}
                  totalImages={photosCount}
                  onViewAll={() => handleTabChange("photos")}
                  isLoading={isPostsLoading}
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
        )}

        {activeTab === "about" && (
          <AboutTab
            name={displayUser?.fullName}
            bio={displayUser?.bio}
            email={displayUser?.email}
            birthday={displayUser?.dateOfBirth?.toString()}
            gender={displayUser?.gender}
            joinedDate={
              displayUser?.createdAt
                ? formatJoinedDate(displayUser.createdAt)
                : undefined
            }
            isLoading={isProfileLoading}
          />
        )}

        {activeTab === "friends" && (
          <FriendsTab
            isLoading={isProfileLoading}
            isOwnProfile={isOwnProfile}
          />
        )}

        {activeTab === "photos" && (
          <MediaGallery
            items={photos}
            isLoading={isPostsLoading}
            mediaType="image"
          />
        )}

        {activeTab === "videos" && (
          <MediaGallery
            items={videos}
            isLoading={isPostsLoading}
            mediaType="video"
          />
        )}
      </div>
    </div>
  );
};

