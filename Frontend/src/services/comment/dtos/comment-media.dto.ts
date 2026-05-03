// Media type matching backend enum (MediaType)
// 1 = Image, 2 = Video, 5 = Document
export type MediaTypeValue = 1 | 2 | 5;

export interface CommentMedia {
  url: string;
  publicId: string;
  type: MediaTypeValue;
}