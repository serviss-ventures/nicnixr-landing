import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CommunityState, CommunityPost, CommunityUser } from '../../types';

const initialState: CommunityState = {
  posts: [],
  users: [],
  myPosts: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  hasMorePosts: true,
};

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPosts: (state, action: PayloadAction<CommunityPost[]>) => {
      state.posts = action.payload;
    },
    addPost: (state, action: PayloadAction<CommunityPost>) => {
      state.posts.unshift(action.payload);
      state.myPosts.unshift(action.payload);
    },
    likePost: (state, action: PayloadAction<string>) => {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;
      }
    },
  },
});

export const { clearError, setPosts, addPost, likePost } = communitySlice.actions;
export default communitySlice.reducer; 