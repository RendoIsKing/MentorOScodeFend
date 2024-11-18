export interface IMessageOnlyResponse {
  message: string;
  data?: any;
}

export function isMessageOnlyResponse(obj: any): obj is IMessageOnlyResponse {
  return !!(obj as IMessageOnlyResponse).message;
}
