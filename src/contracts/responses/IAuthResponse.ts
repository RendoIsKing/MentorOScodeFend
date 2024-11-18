export interface IAuthResponseObject {
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
  createdAt: string;
  updatedAt: string;
  completePhoneNumber: string;
  token: string;
  __v: number;
}

export interface IAuthResponse {
  data?: IAuthResponseObject;
  token?: string;
  message?: string;
}
