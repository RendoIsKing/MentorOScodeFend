export interface Media {
  mediaId: string;
  mediaType: "video" | "image";
  _id: string;
}

export interface MediaFiles {
  _id: string;
  path: string;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: string; // Assuming createdAt and updatedAt are strings representing ISO 8601 formatted dates
  updatedAt: string;
  __v: number;
}

export interface Stories {
  media: Media[];
  mediaFiles: MediaFiles[];
  _id: string;
  isLiked: boolean;
  userInfo: UserInfo
}



export interface UserInfo {
  completePhoneNumber: string;
  createdAt: string; // Assuming createdAt is a string representing an ISO 8601 formatted date
  deletedAt: string | null; // Assuming deletedAt is either a string representing an ISO 8601 formatted date or null
  dialCode: string;
  dob: string; // Assuming dob is a string representing an ISO 8601 formatted date
  email: string;
  fullName: string;
  gender: string;
  hasConfirmedAge: boolean;
  hasDocumentUploaded: boolean;
  hasDocumentVerified: boolean;
  hasPersonalInfo: boolean;
  hasPhotoInfo: boolean;
  hasSelectedInterest: boolean;
  interests: string[]; // Assuming interests is an array of strings
  isActive: boolean;
  isDeleted: boolean;
  isVerified: boolean;
  location: any[]; // Assuming location is an array of any data type
  otp: string;
  otpInvalidAt: string; // Assuming otpInvalidAt is a string representing an ISO 8601 formatted date
  phoneNumber: string;
  photo: any[]; // Assuming photo is an array of any data type
  photoId: string;
  primaryCollection: string;
  role: string;
  stories: Stories[]; // Assuming stories is an array of any data type
  updatedAt: string; // Assuming updatedAt is a string representing an ISO 8601 formatted date
  userName: string;
  verifiedAt: string; // Assuming verifiedAt is a string representing an ISO 8601 formatted date
  verifiedBy: string;
  __v: number;
  _id: string;
}
