import type { ApiResponse } from "@/types/api.response";
import type { SetupUploadResponse } from "./dtos/setup-upload-response";
import type { CloudinaryUploadResponse } from "./dtos/cloudinary-upload.response";
import api from "@/lib/axios/axios";
import { handleApiError } from "@/components/common/helpers/api.helper";

const MEDIA_PATH = "/media";
const CLOUDINARY_BASE = "https://api.cloudinary.com/v1_1";

export const mediaService = {
  // ─── Backend ────────────────────────────────────────────────────────────────

  /** Fetches a signed upload token from the backend for a given Cloudinary folder. */
  getUploadSignature: async (
    folder: string = "socialflow/avatars"
  ): Promise<ApiResponse<SetupUploadResponse>> => {
    try {
      const response = await api.get<SetupUploadResponse>(
        `${MEDIA_PATH}/setup-upload`,
        { params: { folder } }
      );

      return {
        isSuccess: true,
        data: response.data,
        error: null,
        status: response.status,
      };
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  deleteMedia: async (
    publicId: string,
    mediaType: string = "Image"
  ): Promise<ApiResponse<null>> => {
    try {
      await api.delete(MEDIA_PATH, {
        params: { publicId, mediaType },
      });

      return {
        isSuccess: true,
        data: null,
        error: null,
        status: 200,
      };
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  // ─── Cloudinary (direct) ────────────────────────────────────────────────────

  /**
   * Uploads a file directly to Cloudinary using a pre-signed signature.
   * @param file   - The File object to upload
   * @param sig    - Signed upload credentials from {@link getUploadSignature}
   * @param folder - Cloudinary destination folder (e.g. "socialflow/avatars")
   */
  uploadImage: async (
    file: File,
    sig: SetupUploadResponse,
    folder: string
  ): Promise<CloudinaryUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sig.apiKey);
    formData.append("timestamp", sig.timestamp.toString());
    formData.append("signature", sig.signature);
    formData.append("folder", folder);

    const response = await fetch(
      `${CLOUDINARY_BASE}/${sig.cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!response.ok) {
      let detail = "";
      try {
        const err = await response.json();
        detail = (err as { error?: { message?: string } })?.error?.message ?? "";
      } catch { /* ignore parse error */ }
      throw new Error(detail || "Lỗi khi tải ảnh lên Cloudinary");
    }

    return response.json() as Promise<CloudinaryUploadResponse>;
  },

  /**
   * Deletes an image from Cloudinary by its public_id.
   * Errors are silently logged — deletion failure is non-critical.
   */
  deleteImage: async (publicId: string): Promise<void> => {
    try {
      const sigResult = await mediaService.getUploadSignature();
      if (!sigResult.isSuccess || !sigResult.data) return;

      const sig = sigResult.data;
      const formData = new FormData();
      formData.append("public_id", publicId);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", sig.timestamp.toString());
      formData.append("signature", sig.signature);

      await fetch(
        `${CLOUDINARY_BASE}/${sig.cloudName}/image/destroy`,
        { method: "POST", body: formData }
      );
    } catch (error) {
      console.error("[mediaService] Failed to delete image from Cloudinary:", error);
    }
  },

  /**
   * Convenience: fetches a signed upload token then uploads the file in one call.
   * Throws if signature fetch fails so the caller can display a toast.
   */
  getSignatureAndUpload: async (
    file: File,
    folder: string
  ): Promise<CloudinaryUploadResponse> => {
    const sigResult = await mediaService.getUploadSignature(folder);

    if (!sigResult.isSuccess || !sigResult.data) {
      const msg =
        sigResult.error?.detail ||
        sigResult.error?.title ||
        "Lỗi khi lấy chữ ký tải lên";
      throw new Error(msg);
    }

    return mediaService.uploadImage(file, sigResult.data, folder);
  },
};
