import React, { createContext, useContext, useReducer } from "react";

export interface UserTag {
  location: {
    x: number;
    y: number;
  };
  userId: string;
  userName: string;
}

interface UserTagsState {
  userTag: UserTag;
  taggedUsers: UserTag[];
}

const initialState: UserTagsState = {
  userTag: {
    location: {
      x: 0,
      y: 0,
    },
    userId: "",
    userName: "",
  },
  taggedUsers: [],
};

type ActionType =
  | { type: "SET_USER_TAG"; payload: UserTag }
  | { type: "ADD_TAGGED_USER"; payload: UserTag }
  | { type: "REMOVE_TAGGED_USER"; payload: string }
  | { type: "SET_BULK_TAGGED_USERS"; payload: UserTag[] }
  | { type: "RESET_TAGGED_USERS" };

const userTagsReducer = (
  state: UserTagsState,
  action: ActionType
): UserTagsState => {
  switch (action.type) {
    case "SET_USER_TAG":
      return {
        ...state,
        userTag: action.payload,
      };
    case "ADD_TAGGED_USER":
      return {
        ...state,
        taggedUsers: [...state.taggedUsers, action.payload],
      };
    case "REMOVE_TAGGED_USER":
      return {
        ...state,
        taggedUsers: state.taggedUsers.filter(
          (user) => user.userId !== action.payload
        ),
      };
    case "SET_BULK_TAGGED_USERS":
      return {
        ...state,
        taggedUsers: action.payload,
      };
    case "RESET_TAGGED_USERS":
      return {
        ...state,
        taggedUsers: [],
      };
    default:
      return state;
  }
};

const UserTagsContext = createContext<{
  state: UserTagsState;
  dispatch: React.Dispatch<ActionType>;
}>({
  state: initialState,
  dispatch: () => undefined,
});

interface IUserTagsProviderProps {
  children: React.ReactNode;
}

export const useUserTagsContext = () => {
  const context = useContext(UserTagsContext);

  if (!context) {
    throw new Error(
      "useUserTagsContext must be used within a UserTagsContextProvider"
    );
  }

  return context;
};

export const UserTagsContextProvider: React.FC<IUserTagsProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(userTagsReducer, initialState);

  return (
    <UserTagsContext.Provider value={{ state, dispatch }}>
      {children}
    </UserTagsContext.Provider>
  );
};

export default UserTagsContextProvider;
