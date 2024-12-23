import { IAuthResponse } from "./IAuthResponse";

export function isUserLoginResponse(obj: any): obj is IAuthResponse {
  return !!(obj as IAuthResponse).token;
}

export interface ILoginResponseObject {
  dialCode: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  isVerified: boolean;
  otp: string;
  otpInvalidAt: string;
  _id: string;
  location: any[];
  token?: string;
  createdAt: string;
  updatedAt: string;
  completePhoneNumber: string;
  __v: number;
}

export interface IUserLoginResponse {
  data?: ILoginResponseObject;
  token?: string;
  message?: string;
  status?: boolean;
  isPassword?: string;
}
