import { UserBase } from "../haveme/UserBase";

export class VerifyOtpResponseObject {
  data: IVerifyOtpResponse;
  user?: UserBase;
  token: string;
}

export interface IVerifyOtpResponse {
  mobileNo?: string;
  otp?: string;
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: UserBase;
}
