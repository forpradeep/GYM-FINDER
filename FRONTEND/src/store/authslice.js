import { createSlice } from '@reduxjs/toolkit'

const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

const storedUser = getUserFromStorage()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    isLoggedIn: !!storedUser
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
    }
  }
})

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;