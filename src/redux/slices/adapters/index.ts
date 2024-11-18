import { UserBase } from "@/contracts/haveme/UserBase";
import { TransactionObject } from "@/contracts/responses/IGetTransactionResponse";
import { IPostContentObject } from "@/contracts/responses/IPostContentResponse";
import { IPostObjectResponse } from "@/contracts/responses/IPostObjectResponse";
import { RootState } from "@/redux/reducers";
import { notificationApi } from "@/redux/services/haveme/notifications";
import { postsApi } from "@/redux/services/haveme/posts";
import { searchApi } from "@/redux/services/haveme/search";
import { transactionApi } from "@/redux/services/haveme/transactions";
import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";

export const userSearchResultsAdapter = createEntityAdapter({
  selectId: (user: UserBase) => user._id,
});

export const userPostsAdapter = createEntityAdapter({
  selectId: (post: IPostObjectResponse) => post._id,
});

export const homeFeedAdapter = createEntityAdapter({
  selectId: (post: IPostContentObject) => post._id,
});

export const notificationsAdapter = createEntityAdapter({
  selectId: (notification: any) => notification._id,
});

export const userTransactionsAdapter = createEntityAdapter({
  selectId: (transaction: TransactionObject) => transaction._id,
});

export const searchedPostsAdapter = createEntityAdapter({
  selectId: (post: IPostContentObject) => post._id,
});

const initialState = {
  users: userSearchResultsAdapter.getInitialState(),
  userPosts: userPostsAdapter.getInitialState(),
  homeFeed: homeFeedAdapter.getInitialState(),
  notifications: notificationsAdapter.getInitialState(),
  userTransactions: userTransactionsAdapter.getInitialState(),
  searchedPosts: searchedPostsAdapter.getInitialState(),
  userSearchFilters: {
    query: "",
  },
  userTagsFilter: {
    query: "",
  },
};

export const ADAPTERS_RESULTS = "adapters_result";

const adaptersResultsSlice = createSlice({
  name: ADAPTERS_RESULTS,
  initialState,
  reducers: {
    setUserSearchQuery: (state, { payload }) => {
      state.userSearchFilters.query = payload;
    },
    resetUserPosts: (state) => {
      userPostsAdapter.setAll(state.userPosts, []);
    },
    resetSearchedPosts: (state) => {
      searchedPostsAdapter.setAll(state.searchedPosts, []);
    },
    setUserSearchFromTagsData: (state, { payload }) => {
      state.userTagsFilter.query = payload;
    },
    updatePost: (state, { payload }) => {
      userPostsAdapter.upsertOne(state.userPosts, payload);
    },
    updateSearchUsers: (state, { payload }) => {
      userSearchResultsAdapter.upsertOne(state.users, payload);
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      searchApi.endpoints.getUsers.matchFulfilled,
      (state, { payload }) => {
        userSearchResultsAdapter.addMany(state.users, payload.data);
      }
    );
    builder.addMatcher(
      postsApi.endpoints.getPostsByUserName.matchFulfilled,
      (state, { payload }) => {
        userPostsAdapter.addMany(state.userPosts, payload.data);
      }
    );
    builder.addMatcher(
      postsApi.endpoints.getPosts.matchFulfilled,
      (state, { payload }) => {
        homeFeedAdapter.addMany(state.homeFeed, payload.data);
      }
    );

    builder.addMatcher(
      notificationApi.endpoints.getNotification.matchFulfilled,
      (state, { payload }) => {
        notificationsAdapter.addMany(state.notifications, payload.data);
      }
    );

    builder.addMatcher(
      transactionApi.endpoints.getTransactions.matchFulfilled,
      (state, { payload }) => {
        userTransactionsAdapter.addMany(state.userTransactions, payload.data);
      }
    );

    builder.addMatcher(
      postsApi.endpoints.getPosts.matchFulfilled,
      (state, { payload }) => {
        searchedPostsAdapter.addMany(state.searchedPosts, payload.data);
      }
    );
  },
});

export const {
  setUserSearchQuery,
  resetUserPosts,
  resetSearchedPosts,
  setUserSearchFromTagsData,
  updatePost,
  updateSearchUsers,
} = adaptersResultsSlice.actions;

export default adaptersResultsSlice.reducer;

// * user adapter functions
export const selectUserSearchFilters = (state: RootState) =>
  state.adapterResults.userSearchFilters;

export const selectUserSearchFromTags = (state: RootState) =>
  state.adapterResults.userTagsFilter;

export const { selectAll: getAllUsersFromAdapter } =
  userSearchResultsAdapter.getSelectors((state: RootState) => {
    return state.adapterResults.users;
  });

export const selectAllUsers = createSelector(
  getAllUsersFromAdapter,
  (users) => {
    return users.map((user) => user) || [];
  }
);

export const selectAllUsersForTags = createSelector(
  getAllUsersFromAdapter,
  (users) => {
    return (
      users.map((user) => ({ label: user.userName, value: user._id })) || []
    );
  }
);

export const selectFilteredUsers = createSelector(
  selectAllUsers,
  selectUserSearchFilters,
  (users, filters) => {
    return users
      .filter((r) => !!r._id && r.userName)
      .filter(
        (r) =>
          r.userName?.toLowerCase().includes(filters.query?.toLowerCase()) ||
          r.fullName?.toLowerCase().includes(filters.query?.toLowerCase())
      );
    // .map((r) => ChatRoomSerializer.parse(r));
  }
);

export const selectFilteredUsersFromTags = createSelector(
  selectAllUsersForTags,
  selectUserSearchFromTags,
  (users, filters) => {
    return users
      .filter((r) => !!r.label && r.value)
      .filter(
        (r) => r.label?.toLowerCase().includes(filters.query?.toLowerCase())
        // ||
        //   r.fullName?.toLowerCase().includes(filters.query?.toLowerCase())
      );
    // .map((r) => ChatRoomSerializer.parse(r));
  }
);

// * user posts adapter
export const { selectAll: getAllPostFromAdapter } =
  userPostsAdapter.getSelectors((state: RootState) => {
    return state.adapterResults.userPosts;
  });

export const selectAllPostForUser = createSelector(
  getAllPostFromAdapter,
  (posts) => {
    return posts.map((post) => post) || [];
  }
);

// * home adapter functions
export const { selectAll: getHomeFeedsFromAdapter } =
  homeFeedAdapter.getSelectors(
    (state: RootState) => state.adapterResults.homeFeed
  );

export const selectAllHomeFeed = createSelector(
  getHomeFeedsFromAdapter,
  (posts) => posts.map((post) => post) || []
);

// * notifications adapter functions
export const { selectAll: getNotificationsFromAdapter } =
  notificationsAdapter.getSelectors(
    (state: RootState) => state.adapterResults.notifications
  );

export const selectAllNotifications = createSelector(
  getNotificationsFromAdapter,
  (notifications) => notifications.map((notification) => notification) || []
);

//* transactions adapter functions
export const { selectAll: getTransactionsFromAdapter } =
  userTransactionsAdapter.getSelectors(
    (state: RootState) => state.adapterResults.userTransactions
  );

export const selectAllUserTransactions = createSelector(
  getTransactionsFromAdapter,
  (transactions) => transactions.map((transaction) => transaction) || []
);

//* searched post adapter functions
export const { selectAll: getSearchedPostsFromAdapter } =
  searchedPostsAdapter.getSelectors(
    (state: RootState) => state.adapterResults.searchedPosts
  );

export const selectAllSearchedPosts = createSelector(
  getSearchedPostsFromAdapter,
  (posts) => posts.map((post) => post) || []
);
