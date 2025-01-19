import {createSlice} from '@reduxjs/toolkit';
import {
  getAccountInfo,
  getToken,
  login,
  resetPassword,
  updateDisplayName,
} from '../action/user.action';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    userInfo: null,
    resetPassword: null,
    isLoading: false,
    resetPasswordLoading: false,
  },

  reducers: {
    logout(state) {
      state.user = null;
      state.resetPassword = null;
      state.userInfo = null;
      state.isLoading = false;
    },
    clearStatus: state => {
      state.resetPassword = null;
      state.isLoading = false;
    },
    setToken: (state, action) => {
      state.user.idToken = action.payload.access_token;
      state.user.refreshToken = action.payload.refreshToken;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, state => {
        state.isLoading = false;
      })

      //get account information
      .addCase(getAccountInfo.pending, state => {
        state.isLoading = true;
      })
      .addCase(getAccountInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userInfo = action.payload;
      })
      .addCase(getAccountInfo.rejected, state => {
        state.isLoading = false;
      })

      //refresh token
      .addCase(getToken.pending, state => {
        state.isLoading = true;
      })
      .addCase(getToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user.idToken = action.payload.access_token;
        state.user.refreshToken = action.payload.refresh_token;
      })
      .addCase(getToken.rejected, state => {
        state.isLoading = false;
      })

      //reset password
      .addCase(resetPassword.pending, state => {
        state.resetPasswordLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.resetPasswordLoading = false;
      })
      .addCase(resetPassword.rejected, state => {
        state.resetPasswordLoading = false;
      })

      //update display name
      .addCase(updateDisplayName.pending, state => {
        state.isLoading = true;
      })
      .addCase(updateDisplayName.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(updateDisplayName.rejected, (state, action) => {
        state.isLoading = false;
      });
  },
});

export const {logout, clearStatus, setToken} = userSlice.actions;

export default userSlice.reducer;
