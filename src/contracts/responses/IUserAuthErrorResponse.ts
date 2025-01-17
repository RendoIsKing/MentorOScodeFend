import { IMessageOnlyResponse } from "./IMessageOnlyResponse";

export interface IUserAuthErrorResponse {
    data: IMessageOnlyResponse;
    message?: string;
}
