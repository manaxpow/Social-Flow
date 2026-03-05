import React, { useEffect } from "react";
import { MapPin, Calendar, Edit3, Loader2, Grid3X3 } from "lucide-react";
import { toast } from "sonner";
import { useInView } from "react-intersection-observer";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { useAppSelector } from "@/stores/hook";
import { postService } from "@/services/post/post.service";
import type { PostDetailResponse } from "@/services/post/dtos/response/post-detail.response";
import type { PagedList } from "@/types/paged-list.response";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "../../social/post/post-card";
import { CreatePostDialog } from "../../social/post/post-create";
import { AvatarUploader } from "./avatar-uploader";

const UserProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);
  const { ref, inView } = useInView({ threshold: 0.1 });

  const fullName = user ? `${user.firstName} ${user.lastName}` : "User";
  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "??";

  // 1. INFINITE QUERY tải bài viết cá nhân
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<PagedList<PostDetailResponse>, Error>({
    queryKey: ["my-posts", user?.id],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await postService.getPosts(pageParam as number, 5);
      if (!response.isSuccess || !response.data)
        throw new Error("Fetch failed");
      return response.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.currentPage + 1 : undefined,
    initialPageParam: 1,
    enabled: !!user?.id,
  });

  // 2. Tự động load trang mới khi scroll (Infinite Scroll)
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 3. Xử lý Xóa bài viết
  const deleteMutation = useMutation({
    mutationFn: (postId: string) => postService.deletePost(postId),
    onSuccess: () => {
      toast.success("Đã xóa bài viết thành công");
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    },
    onError: (err) => toast.error(err.message || "Lỗi khi xóa bài viết"),
  });

  // Flat data từ các pages
  const allPosts = data?.pages.flatMap((page) => page?.items ?? []) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  return (
    <div className="w-full bg-[#f0f2f5] min-h-screen pb-10">
      {/* --- HEADER SECTION --- */}
      <div className="bg-background shadow-sm border-b">
        <div className="max-w-[1250px] mx-auto">
          <div className="relative px-0 md:px-4">
            {/* Ảnh bìa */}
            <div className="aspect-[2.5/1] md:aspect-[3.5/1] bg-slate-200 overflow-hidden md:rounded-b-xl">
              <img
                src="https://images.unsplash.com/photo-1557683316-973673baf926"
                className="w-full h-full object-cover"
                alt="Cover"
              />
            </div>

            {/* Avatar và Thông tin cơ bản */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 px-4 md:px-10 -mt-12 md:-mt-16 pb-6 relative z-10">
              {/* Sử dụng Component đổi Avatar mới */}
              <AvatarUploader
                currentAvatar={user?.avatarUrl}
                initials={initials}
              />

              <div className="flex-1 text-center md:text-left mb-2">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  {fullName}
                </h1>
                <p className="text-muted-foreground font-semibold">
                  1.2K Friends • {totalCount} Posts
                </p>
              </div>

              <div className="mb-2">
                <Button className="bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold px-6 rounded-md">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              </div>
            </div>

            {/* Tabs Điều hướng */}
            <div className="border-t mx-4 md:mx-10">
              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="h-12 bg-transparent gap-2 p-0">
                  <TabsTrigger
                    value="posts"
                    className="data-[state=active]:text-[#1877f2] data-[state=active]:border-b-4 data-[state=active]:border-[#1877f2] rounded-none px-4 h-full font-bold bg-transparent"
                  >
                    Posts
                  </TabsTrigger>
                  <TabsTrigger
                    value="about"
                    className="px-4 h-full font-bold bg-transparent"
                  >
                    About
                  </TabsTrigger>
                  <TabsTrigger
                    value="friends"
                    className="px-4 h-full font-bold bg-transparent"
                  >
                    Friends
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* --- BODY SECTION --- */}
      <div className="max-w-[1250px] mx-auto px-4 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* CỘT TRÁI (Thông tin giới thiệu & Ảnh) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="shadow-sm border-none">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Intro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <>
                    <p className="text-center text-[15px]">
                      {user?.bio || "No bio available."}
                    </p>
                    <Button
                      variant="secondary"
                      className="w-full font-bold bg-[#e4e6eb]"
                    >
                      Edit Bio
                    </Button>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-[15px]">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        Born on{" "}
                        <strong>
                          {user?.dateOfBirth
                            ? new Date(user.dateOfBirth).toLocaleDateString(
                                "vi-VN",
                              )
                            : "N/A"}
                        </strong>
                      </div>
                      <div className="flex items-center gap-2 text-[15px]">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        From <strong>Vietnam</strong>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-none overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Photos</CardTitle>
                <Button
                  variant="ghost"
                  className="text-[#1877f2] font-normal hover:bg-blue-50"
                >
                  See all
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 rounded-lg overflow-hidden bg-slate-50 min-h-[100px]">
                  {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-square w-full" />
                      ))
                    : allPosts
                        .filter((p) => p.mediaUrl)
                        .slice(0, 9)
                        .map((p) => (
                          <img
                            key={p.id}
                            src={p.mediaUrl!}
                            className="aspect-square object-cover w-full hover:brightness-90 cursor-pointer transition-all"
                            alt="Media"
                          />
                        ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CỘT PHẢI (Danh sách bài viết) */}
          <div className="lg:col-span-7 space-y-4">
            <CreatePostDialog
              onPostCreated={() =>
                queryClient.invalidateQueries({ queryKey: ["my-posts"] })
              }
            />

            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="p-4 space-y-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                  </Card>
                ))
              ) : isError ? (
                <Card className="p-10 text-center text-destructive">
                  Đã có lỗi xảy ra khi tải bài viết.
                </Card>
              ) : allPosts.length > 0 ? (
                <>
                  {allPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      fullName={fullName}
                      avatar={user?.avatarUrl}
                      onDelete={(id) => deleteMutation.mutate(id)}
                    />
                  ))}

                  {/* Infinity Scroll Trigger */}
                  <div ref={ref} className="py-8 flex justify-center">
                    {isFetchingNextPage ? (
                      <Loader2 className="h-8 w-8 animate-spin text-[#1877f2]" />
                    ) : hasNextPage ? (
                      <span className="text-sm text-muted-foreground italic">
                        Đang tải thêm...
                      </span>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-4 opacity-50">
                        <Grid3X3 className="h-8 w-8" />
                        <p className="text-sm font-medium">
                          Bạn đã xem hết bài viết
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 bg-background rounded-xl shadow-sm border-none font-medium">
                  Chưa có bài viết nào để hiển thị
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
