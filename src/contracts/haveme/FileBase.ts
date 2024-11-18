export type FileBase = {
    _id: string;
    path: string;
    isDeleted?: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
  };
  
  export class File implements FileBase {
    constructor(
      public _id: string,
      public path: string,
      public createdAt: string,
      public updatedAt: string,
      public deletedAt: string,
      public userName: string,
      public isDeleted?: boolean,
    ) {}
  }
  