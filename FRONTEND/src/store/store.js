import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authslice'

export const store = configureStore({
  reducer: {
    auth: authReducer
  }
})

// Save to localStorage whenever state changes
store.subscribe(() => {
  const state = store.getState().auth
  if (state.isLoggedIn) {
    localStorage.setItem('user', JSON.stringify(state.user))
  } else {
    localStorage.removeItem('user')
  }
})