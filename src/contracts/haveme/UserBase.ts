import { ILatLongObject, photoObj } from "../requests/ICreateUserRequest";
import {
  IGetSubscriptionPlanResponse,
  ISubscriptionPlanObject,
} from "../responses/IGetSubscriptionPlanResponse";

export type UserBase = {
  isFollowing: boolean;
  userPhoto: any;
  _id: string;
  __v: string;
  completePhoneNumber: string;
  dialCode: string;
  interests: string[];
  isActive: boolean;
  isDeleted: boolean;
  isVerified: boolean;
  location: ILatLongObject[];
  otp: string;
  otpInvalidAt: Date;
  phoneNumber: string;
  photoId: string;
  photoPath: string;
  email: string;
  password: string;
  fullName: string;
  mobileNumber: string;
  role: string | number;
  status: number;
  age: number;
  gender: string;
  dob: string;
  avatar: string;
  bio: string;
  verifiedAt: string;
  verifiedBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  userName: string;
  hasPersonalInfo?: boolean;
  hasPhotoInfo?: boolean;
  hasSelectedInterest?: boolean;
  hasConfirmedAge?: boolean;
  hasDocumentVerified?: boolean;
  hasDocumentUploaded?: boolean;
  isLoggedIn?: boolean;
  primaryCollection?: string;
  photo?: photoObj;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  totalLikes?: number;
  coverPhoto?: photoObj;
  instagramLink?: string;
  youtubeLink?: string;
  tiktokLink?: string;
  subscriptionPlans?: ISubscriptionPlanObject[];
  hasPlan?: boolean;
  subscriberCount: number;
  fcm_token?: string;
};

export class User implements UserBase {
  id: string;
  constructor(
    public isFollowing: boolean,
    public subscriberCount: number,
    public userPhoto: any,
    public _id: string,
    public __v: string,
    public completePhoneNumber: string,
    public dialCode: string,
    public interests: string[],
    public isActive: boolean,
    public isDeleted: boolean,
    public isVerified: boolean,
    public location: ILatLongObject[],
    public otp: string,
    public otpInvalidAt: Date,
    public phoneNumber: string,
    public photoId: string,
    public photoPath: string,
    public email: string,
    public password: string,
    public fullName: string,
    public mobileNumber: string,
    public role: string | number,
    public status: number,
    public age: number,
    public gender: string,
    public dob: string,
    public avatar: string,
    public bio: string,
    public verifiedAt: string,
    public verifiedBy: string,
    public createdAt: string,
    public updatedAt: string,
    public deletedAt: string,
    public userName: string,
    public hasPersonalInfo?: boolean,
    public hasPhotoInfo?: boolean,
    public hasSelectedInterest?: boolean,
    public hasConfirmedAge?: boolean,
    public hasDocumentVerified?: boolean,
    public hasDocumentUploaded?: boolean,
    public primaryCollection?: string,
    public photo?: photoObj,
    public followersCount?: number,
    public followingCount?: number,
    public postsCount?: number,
    public totalLikes?: number,
    public coverPhoto?: photoObj,
    public instagramLink?: string,
    public youtubeLink?: string,
    public tiktokLink?: string,
    public subscriptionPlans?: ISubscriptionPlanObject[],
    public hasPlan?: boolean,
    public fcm_token?: string
  ) {}

  get isLoggedIn(): boolean {
    return (
      !!this.hasPersonalInfo &&
      !!this.hasPhotoInfo &&
      !!this.hasSelectedInterest &&
      !!this.hasConfirmedAge &&
      !!this.hasDocumentVerified &&
      !!this.hasDocumentUploaded
    );
  }
}
