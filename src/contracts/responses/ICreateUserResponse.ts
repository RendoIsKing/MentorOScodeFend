import { User } from "../haveme/UserBase";

export interface ICreateUserResponse {
  data: User;
}
export interface IUpdateUserResponse {
  message: string;
  data: User;
}
