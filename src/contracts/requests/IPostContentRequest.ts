export interface IPostContentStatusObject {
  id: number;
  name: string;
}
export interface PostMediaObject {
  mediaId: string;
  mediaType: string;
  _id?: string;
}
export interface IPostContentRequest {
  id?: string;
  content?: string;
  mediaUrl?: string;
  contentType?: string;
  userId?: string;
  tags?: string[];
  privacy?: string;
  status?: string;
  media?: PostMediaObject[];
  orientation?: string;
  type?: string;
  isPinned?: boolean;
}

export interface IGetPostContentRequest {
  page: number;
  perPage: number;
  filter?: string;
  search?: string;
}
