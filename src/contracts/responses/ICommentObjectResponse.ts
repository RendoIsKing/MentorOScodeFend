interface Reply {
    // Define the structure of a reply if known
    // Example fields
    replyId: string;
    userId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

interface Like {
    // Define the structure of a like if known
    // Example fields
    userId: string;
    likedAt: string;
}

interface Collection {
    // Define the structure of a collection if known
    // Example fields
    collectionId: string;
    name: string;
}

export interface ICommentObjectResponse {
    data: any;
    type: string; 
    post: string;
    user: string;
    replies: Reply[]; 
    likes: Like[]; 
    interactedBy: string;
    comment: string; 
    collectionId: Collection[];
    isDeleted: boolean;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}