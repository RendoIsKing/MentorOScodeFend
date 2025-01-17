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
  isPassword: boolean;
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
  status: boolean;
  isPassword: string;
  data?: IAuthResponseObject;
  token?: string;
  message?: string;
}
