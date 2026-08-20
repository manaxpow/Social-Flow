import { type Area } from "react-easy-crop";
import { toast } from "sonner";
import { mediaService } from "@/services/media/media.service";
import { getErrorMessage } from "@/components/common/helpers/api.helper";

// ─── Canvas crop utility ─────────────────────────────────────────────────────
/**
 * Uses `URL.createObjectURL` when a File is provided for better memory efficiency,
 * falling back to a plain src assignment for data-URLs.
 */
const createImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

/**
 * Crops `imageSrc` to the pixel region defined by `pixelCrop`,
 * encodes the result as a JPEG Blob, and wraps it in a named File.
 *
 * Uses the standard react-easy-crop canvas pattern.
 * Returns `null` if `toBlob` fails (e.g. canvas tainted cross-origin).
 */
export const getCroppedFile = async (
  imageSrc: string,
  pixelCrop: Area,
  filename: string,
  quality = 0.9,
): Promise<File | null> => {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });

  return blob ? new File([blob], filename, { type: "image/jpeg" }) : null;
};

// ─── Hook ────────────────────────────────────────────────────────────────────

interface CropUploadConfig<TVariables = Record<string, string>> {
  /** Data-URL of the image to crop and upload */
  imageSrc: string | null;
  /** Pixel-level crop region from react-easy-crop's `onCropComplete` */
  croppedAreaPixels: Area | null;
  /** Public ID of the previously uploaded (but not yet confirmed) image — used for rollback on cancel */
  uploadedPublicId: string | null;
  /** Filename used when creating the cropped File (e.g. "avatar.jpg") */
  filename: string;
  /** Cloudinary destination folder (e.g. "socialflow/avatars") */
  cloudinaryFolder: string;
  /** Mutation returned by useUpdateAvatarMutation / useUpdateCoverMutation */
  mutation: { mutate: (variables: TVariables) => void };
  /** Key used for the URL field in the mutation payload (e.g. "avatarUrl" | "coverUrl") */
  urlKey: string;
  setUploadedImageUrl: (url: string) => void;
  setUploadedPublicId: (id: string) => void;
  setIsUploadingToCloudinary: (loading: boolean) => void;
  setIsDialogOpen: (open: boolean) => void;
  resetState: () => void;
}

/**
 * Provides `handleSaveCrop` and `handleCancel` handlers shared between
 * AvatarUploader and CoverUploader.
 *
 * Crop → Cloudinary upload → backend mutation are all wired here.
 * Only `filename`, `cloudinaryFolder`, and `urlKey` differ between callers.
 */
export const useImageCropUpload = <TVariables = Record<string, string>>({
  imageSrc,
  croppedAreaPixels,
  uploadedPublicId,
  filename,
  cloudinaryFolder,
  mutation,
  urlKey,
  setUploadedImageUrl,
  setUploadedPublicId,
  setIsUploadingToCloudinary,
  setIsDialogOpen,
  resetState,
}: CropUploadConfig<TVariables>) => {
  const handleSaveCrop = async (): Promise<void> => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;

      setIsUploadingToCloudinary(true);

      // Step 1 – crop via the shared getCroppedFile utility (react-easy-crop pattern)
      const file = await getCroppedFile(imageSrc, croppedAreaPixels, filename);
      if (!file) throw new Error("Không thể tạo tệp ảnh");

      // Step 2 – sign & upload to Cloudinary via mediaService
      const cloudinaryResponse = await mediaService.getSignatureAndUpload(
        file,
        cloudinaryFolder,
      );

      // Step 3 – persist state so the mutation callback can read the URL
      setUploadedImageUrl(cloudinaryResponse.secure_url);
      setUploadedPublicId(cloudinaryResponse.public_id);
      setIsUploadingToCloudinary(false);

      // Step 4 – save to backend
      mutation.mutate({
        [urlKey]: cloudinaryResponse.secure_url,
        publicId: cloudinaryResponse.public_id,
      } as unknown as TVariables);
    } catch (e) {
      toast.error(getErrorMessage(e, "handleSaveCrop"));
      setIsUploadingToCloudinary(false);
    }
  };

  const handleCancel = async (): Promise<void> => {
    // Roll back the Cloudinary upload if the user cancels before confirming
    if (uploadedPublicId) {
      await mediaService.deleteImage(uploadedPublicId);
    }
    setIsDialogOpen(false);
    resetState();
  };

  return { handleSaveCrop, handleCancel };
};
