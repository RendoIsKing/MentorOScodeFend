import { IMessageOnlyResponse } from "./IMessageOnlyResponse";

export interface IApiErrorResponse {
    error: IMessageOnlyResponse;
    
}

export function isApiErrorResponse(obj: any): obj is IApiErrorResponse {
    return !!obj && !!(obj as IApiErrorResponse).error;
}

// export interface
