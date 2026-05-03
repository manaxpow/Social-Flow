import { useRef, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Image as ImageIcon, Video, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { mediaService } from "@/services/media/media.service";
import type { CommentMedia } from "@/services/comment/dtos/comment-media.dto";

type MediaType = "image" | "video" | "file";

interface UploadedMedia {
  url: string;
  publicId: string;
  type: 1 | 2 | 5; // 1=Image, 2=Video, 5=Document
}

interface CommentInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onMediaSubmit?: (media: CommentMedia) => Promise<void>;
  isPending: boolean;
  placeholder?: string;
  currentUserAvatar?: string | null;
  currentUserName?: string;
  autoFocus?: boolean;
  size?: "sm" | "md";
  showToolbar?: boolean;
  maxLength?: number;
}

const MAX_HEIGHT = 200;

export const CommentInputField = ({
  value,
  onChange,
  onSubmit,
  onMediaSubmit,
  isPending,
  placeholder = "Viết bình luận...",
  currentUserAvatar,
  currentUserName,
  autoFocus = false,
  size = "md",
  showToolbar = true,
  maxLength = 2000,
}: CommentInputFieldProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, MAX_HEIGHT) + "px";
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!uploadedMedia) {
        onSubmit();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value.slice(0, maxLength);
    onChange(newValue);
  };

  // Upload to Cloudinary using presign URL
  const uploadToCloudinary = async (
    file: File,
    folder: string,
    signature: { signature: string; timestamp: number; apiKey: string; cloudName: string }
  ): Promise<{ url: string; publicId: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", signature.timestamp.toString());
    formData.append("signature", signature.signature);
    formData.append("folder", folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  };

  // Convert MediaType to backend enum value
  const getMediaTypeValue = (type: MediaType): 1 | 2 | 5 => {
    switch (type) {
      case "image":
        return 1;
      case "video":
        return 2;
      default:
        return 5;
    }
  };

  // Handle file selection - auto upload immediately
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, mediaType: MediaType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File quá lớn. Vui lòng chọn file nhỏ hơn 50MB");
      return;
    }

    // Validate file type
    if (mediaType === "image" && !file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }
    if (mediaType === "video" && !file.type.startsWith("video/")) {
      toast.error("Vui lòng chọn file video");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Determine folder based on media type
      const folder = mediaType === "image"
        ? "socialflow/comments/images"
        : mediaType === "video"
          ? "socialflow/comments/videos"
          : "socialflow/comments/files";

      // Get presign signature
      const signatureResult = await mediaService.getUploadSignature(folder);
      if (!signatureResult.isSuccess || !signatureResult.data) {
        throw new Error("Cannot get upload signature");
      }

      setUploadProgress(30);

      // Upload to Cloudinary
      const result = await uploadToCloudinary(file, folder, signatureResult.data);

      setUploadProgress(100);

      // Store uploaded media info with type
      setUploadedMedia({
        url: result.url,
        publicId: result.publicId,
        type: getMediaTypeValue(mediaType),
      });

    } catch {
      toast.error("Không thể upload file");
      setUploadedMedia(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }

    // Reset input
    e.target.value = "";
  };

  // Handle remove file - delete from Cloudinary if uploaded
  const handleRemoveFile = async () => {
    if (uploadedMedia?.publicId) {
      try {
        await mediaService.deleteMedia(uploadedMedia.publicId);
      } catch {
        console.error("Failed to delete media from Cloudinary");
      }
    }
    setUploadedMedia(null);
    setUploadProgress(0);
  };

  // Get file icon based on type
  const getFileIcon = (publicId: string) => {
    const ext = publicId.split('.').pop()?.toLowerCase() || '';
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) {
      return <Video className="h-4 w-4" />;
    }
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(ext)) {
      return <FileText className="h-4 w-4" />;
    }
    return <ImageIcon className="h-4 w-4" />;
  };

  const avatarSize = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const textSize = size === "sm" ? "text-[13px]" : "text-[14px]";
  const toolbarButtonSize = size === "sm" ? "h-6 w-6" : "h-7 w-7";

  // Get file name from publicId
  const getFileName = (publicId: string) => {
    const parts = publicId.split('/');
    return parts[parts.length - 1] || publicId;
  };

  return (
    <div className="flex items-start gap-2">
      <Avatar className={`${avatarSize} shrink-0`}>
        <AvatarImage src={currentUserAvatar ?? undefined} />
        <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-xs font-bold">
          {currentUserName?.[0]?.toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        {/* Uploaded File Preview */}
        {uploadedMedia && (
          <div className="mb-2 relative">
            {uploadedMedia.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
              // Image preview
              <div className="relative inline-block">
                <img
                  src={uploadedMedia.url}
                  alt="Preview"
                  className="max-h-32 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              // File/Video preview
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-3 pr-10 relative">
                {getFileIcon(uploadedMedia.publicId)}
                <span className="text-sm truncate max-w-[200px]">{getFileName(uploadedMedia.publicId)}</span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute right-2 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-3 py-2">
          <textarea
            ref={textareaRef}
            placeholder={placeholder}
            className={`flex-1 w-full bg-transparent ${textSize} outline-none placeholder:text-muted-foreground resize-none`}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isPending || isUploading}
            rows={1}
            style={{ height: "22px", minHeight: "22px", maxHeight: MAX_HEIGHT + "px" }}
            autoFocus={autoFocus}
          />
        </div>
        {showToolbar && (
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={`${toolbarButtonSize} rounded-full text-muted-foreground hover:text-foreground hover:bg-transparent`}
                title="Ảnh"
                onClick={() => imageInputRef.current?.click()}
                disabled={isPending || isUploading || !!uploadedMedia}
              >
                <ImageIcon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`${toolbarButtonSize} rounded-full text-muted-foreground hover:text-foreground hover:bg-transparent`}
                title="Video"
                onClick={() => videoInputRef.current?.click()}
                disabled={isPending || isUploading || !!uploadedMedia}
              >
                <Video className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`${toolbarButtonSize} rounded-full text-muted-foreground hover:text-foreground hover:bg-transparent`}
                title="File"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending || isUploading || !!uploadedMedia}
              >
                <FileText className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {maxLength > 500 && (
                <span
                  className={`text-[11px] ${
                    value.length > maxLength * 0.9 ? "text-amber-500" : "text-muted-foreground"
                  }`}
                >
                  {value.length}/{maxLength}
                </span>
              )}
              {uploadedMedia ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${size === "sm" ? "h-6 w-6" : "h-7 w-7"} rounded-full text-blue-600 hover:text-blue-700 hover:bg-transparent`}
                  onClick={() => {
                    onMediaSubmit?.({
                      url: uploadedMedia.url,
                      publicId: uploadedMedia.publicId,
                      type: uploadedMedia.type,
                    });
                    setUploadedMedia(null);
                  }}
                  disabled={isPending || isUploading}
                >
                  {isUploading ? (
                    <Loader2 className={size === "sm" ? "h-3 w-3 animate-spin" : "h-4 w-4 animate-spin"} />
                  ) : (
                    <Send className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
                  )}
                </Button>
              ) : value.trim() ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${size === "sm" ? "h-6 w-6" : "h-7 w-7"} rounded-full text-blue-600 hover:text-blue-700 hover:bg-transparent`}
                  onClick={onSubmit}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className={size === "sm" ? "h-3 w-3 animate-spin" : "h-4 w-4 animate-spin"} />
                  ) : (
                    <Send className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
                  )}
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e, "image")}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e, "video")}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          className="hidden"
          onChange={(e) => handleFileSelect(e, "file")}
        />
      </div>
    </div>
  );
};