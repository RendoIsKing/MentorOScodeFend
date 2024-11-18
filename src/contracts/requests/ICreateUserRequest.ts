export interface ILatLongObject {
  latitude: number;
  longitude: number;
}
export interface ICreateUserRequest {
  email?: string;
  password?: string;
  fullName?: string;
  userName?: string;
  photoId?: string;
  bio?: string;
  dob?: Date;
  gender?: string;
  location?: ILatLongObject[];
}
export interface IUpdateUserRequest {
  id?: string;
  email?: string;
  password?: string;
  fullName?: string;
  userName?: string;
  photoId?: string;
  bio?: string;
  dob?: Date;
  gender?: string;
  location?: ILatLongObject[];
  coverPhotoId?: string;
}

export interface photoObj {
  _id: string;
  path: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
