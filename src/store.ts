import { configureStore } from '@reduxjs/toolkit'
import blogReducer from './pages/blog/blog.reducer'

// function configureStore nó sẽ generate ra 1 store object
export const store = configureStore({
  reducer: { blog: blogReducer }
})

// lấy rootState và AppDispatch từ store của chúng ta (phục vụ cho vấn đề typeScript thôi)
export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
