export type MediaType = 'Image' | 'Video';

export interface PostMediaDto {
  id: string;
  url: string;
  publicId: string;
  mediaType: MediaType;
  order: number;
}
