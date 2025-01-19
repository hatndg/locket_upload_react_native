import {createAsyncThunk} from '@reduxjs/toolkit';
import {loginHeader} from '../../util/header';
import {setMessage} from '../slice/message.slice';
import instanceFirebase from '../../util/axios_firebase';
import instanceLocket from '../../util/axios_locketcamera';
import axios from 'axios';
import {logout} from '../slice/user.slice';

export const login = createAsyncThunk('login', async (data, thunkApi) => {
  try {
    const {email, password} = data;
    const body = {
      email: email,
      password: password,
      clientType: 'CLIENT_TYPE_IOS',
      returnSecureToken: true,
    };
    const response = await instanceFirebase.post(
      `verifyPassword?key=${process.env.GOOGLE_API_KEY}`,
      body,
      {headers: loginHeader},
    );
    if (response.status === 200) {
      return response.data;
    } else {
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${response.statusMessage}`,
          type: 'Error',
        }),
      );
      thunkApi.rejectWithValue();
    }
  } catch (error) {
    thunkApi.dispatch(
      setMessage({
        message: `Error: ${error?.response?.data?.error?.message}`,
        type: 'Error',
      }),
    );
    thunkApi.rejectWithValue();
  }
});

export const resetPassword = createAsyncThunk(
  'resetPassword',
  async (data, thunkApi) => {
    try {
      const {email} = data;
      const body = {
        data: {email: email},
      };
      const response = await instanceLocket.post(
        'sendPasswordResetEmail',
        body,
      );
      const statusCode = response.data.result.status;
      const res = statusCode === 200;
      if (res) {
        thunkApi.dispatch(
          setMessage({
            message: 'Password reset email has been sent',
            type: 'Success',
          }),
        );
        return '';
      } else {
        thunkApi.dispatch(
          setMessage({
            message: `Error: ${response.statusMessage}`,
            type: 'Error',
          }),
        );
        thunkApi.rejectWithValue();
      }
    } catch (error) {
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${error?.response?.data?.error}`,
          type: 'Error',
        }),
      );
      thunkApi.rejectWithValue();
    }
  },
);

export const getAccountInfo = createAsyncThunk(
  'getAccountInfo',
  async (data, thunkApi) => {
    const {idToken, refreshToken} = data;

    try {
      const body = {
        idToken,
      };

      const response = await instanceFirebase.post(
        `getAccountInfo?key=${process.env.GOOGLE_API_KEY}`,
        body,
        {
          headers: {...loginHeader},
        },
      );
      if (response.status === 200) {
        return response.data;
      } else {
        thunkApi.dispatch(
          setMessage({
            message: `Error: ${response.data}`,
            type: 'Error',
          }),
        );
        thunkApi.rejectWithValue();
      }
    } catch (error) {
      thunkApi.dispatch(getToken({refreshToken}));
      thunkApi.rejectWithValue();
    }
  },
);

export const getToken = createAsyncThunk(
  'refreshToken',
  async (data, thunkApi) => {
    try {
      const {refreshToken} = data;
      const body = {
        grant_type: 'refresh_token',
        refreshToken,
      };
      const response = await axios.post(
        `https://securetoken.googleapis.com/v1/token?key=${process.env.GOOGLE_API_KEY}`,
        body,
        {headers: loginHeader},
      );
      if (response.status === 200) {
        return response.data;
      } else {
        thunkApi.dispatch(
          setMessage({
            message: `Error: ${response.data}`,
            type: 'Error',
          }),
        );
        thunkApi.rejectWithValue();
      }
    } catch (error) {
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${JSON.stringify(error?.response?.data?.error)}`,
          type: 'Error',
        }),
      );
      thunkApi.dispatch(logout());
      thunkApi.rejectWithValue();
    }
  },
);

export const updateDisplayName = createAsyncThunk(
  'updateDisplayName',
  async (data, thunkApi) => {
    const {last_name, first_name, idToken, refreshToken} = data;
    const body = {
      data: {
        first_name,
        last_name,
      },
    };
    try {
      const response = await instanceLocket.post('changeProfileInfo', body, {
        headers: {
          ...loginHeader,
          Authorization: 'Bearer ' + idToken,
        },
      });

      if (response.status === 200) {
        thunkApi.dispatch(
          setMessage({
            message: 'Display Name updated successfully',
            type: 'Success',
          }),
        );
        thunkApi.dispatch(getAccountInfo({idToken, refreshToken}));
        return response.data;
      } else {
        thunkApi.dispatch(
          setMessage({
            message: `Error: ${response.data?.error}`,
            type: 'Error',
          }),
        );
        thunkApi.rejectWithValue();
      }
    } catch (error) {
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${JSON.stringify(error?.response?.data?.error)}`,
          type: 'Error',
        }),
      );
      thunkApi.rejectWithValue();
    }
  },
);
