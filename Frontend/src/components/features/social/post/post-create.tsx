import React, { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Smile, X, Loader2, Users, Plus } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useAppSelector } from "@/stores/hook";
import { postService } from "@/services/post/post.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  createPostSchema,
  type CreatePostValues,
} from "@/lib/zod/post/post.schema";

export const CreatePostDialog = ({
  onPostCreated,
}: {
  onPostCreated?: () => void;
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { content: "" },
  });

  const selectedFile = watch("image");
  const contentValue = watch("content");

  // Xử lý File khi Drop
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setValue("image", file, { shouldValidate: true });
        setPreviewUrl(URL.createObjectURL(file));
      }
    },
    [setValue],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const removeImage = () => {
    setValue("image", undefined);
    setPreviewUrl(null);
  };

  const onSubmit = async (values: CreatePostValues) => {
    setIsSubmitting(true);
    const response = await postService.createPost(values.content, values.image);

    if (response.isSuccess) {
      toast.success("Đã đăng bài viết!");
      handleClose();
      onPostCreated?.();
    } else {
      toast.error("Không thể đăng bài");
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
    setPreviewUrl(null);
  };

  // Cleanup preview URL để tránh rò rỉ bộ nhớ
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="w-full space-y-4">
      <Card className="shadow-sm border-none md:border md:rounded-xl">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
            </Avatar>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="flex-1 justify-start rounded-full bg-[#f0f2f5] hover:bg-[#e4e6eb] text-muted-foreground text-[17px] font-normal h-10 px-4"
                >
                  {user?.firstName} ơi, bạn đang nghĩ gì thế?
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
                <DialogHeader className="p-4 border-b">
                  <DialogTitle className="text-center text-xl font-bold">
                    Tạo bài viết
                  </DialogTitle>
                </DialogHeader>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="p-4 space-y-4"
                >
                  <div className="flex gap-3 items-center">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={user?.avatarUrl} />
                    </Avatar>
                    <div>
                      <p className="font-bold text-[15px]">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <div className="flex items-center gap-1 bg-[#e4e6eb] px-2 py-0.5 rounded-md w-fit mt-0.5 text-[12px] font-semibold">
                        <Users className="h-3 w-3" /> Bạn bè
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Textarea
                      {...register("content")}
                      placeholder={`${user?.firstName} ơi, bạn đang nghĩ gì thế?`}
                      className="border-none focus-visible:ring-0 text-xl md:text-2xl resize-none p-0 min-h-[120px] placeholder:text-muted-foreground/60 shadow-none"
                    />
                    {errors.content && (
                      <p className="text-xs text-destructive">
                        {errors.content.message}
                      </p>
                    )}
                  </div>

                  <div className="relative border rounded-lg p-2 group">
                    {!previewUrl ? (
                      <div
                        {...getRootProps()}
                        className={`flex flex-col items-center justify-center min-h-[180px] bg-[#f7f8fa] hover:bg-[#ecedf0] rounded-lg cursor-pointer transition-colors border-2 border-dashed ${isDragActive ? "border-primary bg-primary/5" : "border-transparent"}`}
                      >
                        <input {...getInputProps()} />
                        <div className="bg-[#e4e6eb] p-3 rounded-full mb-2">
                          <Plus className="h-6 w-6" />
                        </div>
                        <p className="font-bold text-[17px]">Thêm ảnh/video</p>
                        <p className="text-xs text-muted-foreground">
                          hoặc kéo và thả
                        </p>
                      </div>
                    ) : (
                      <div className="relative rounded-lg overflow-hidden border">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full object-cover max-h-[300px]"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute top-2 right-2 rounded-full h-8 w-8 shadow-md"
                          onClick={removeImage}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                    {errors.image && (
                      <p className="text-xs text-destructive mt-2">
                        {errors.image.message as string}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg shadow-sm">
                    <span className="font-bold text-[15px]">
                      Thêm vào bài viết
                    </span>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-[#45bd62]"
                      >
                        <ImageIcon className="h-6 w-6" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-[#f7b928]"
                      >
                        <Smile className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-bold bg-[#1877f2] hover:bg-[#166fe5] text-white py-6 text-md disabled:opacity-50"
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      "Đăng"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
