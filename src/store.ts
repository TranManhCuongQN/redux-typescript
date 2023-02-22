import { blogApi } from './pages/blog/blog.service'
import { useDispatch } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import blogReducer from './pages/blog/blog.slice'
import { setupListeners } from '@reduxjs/toolkit/dist/query'

// function configureStore nó sẽ generate ra 1 store object
export const store = configureStore({
  reducer: {
    blog: blogReducer,
    [blogApi.reducerPath]: blogApi.reducer // thêm reducer được tạo từ api slice
  },

  // Thêm api middleware để enable các tính năng như caching, invalidation, polling của RTK Query
  middleware(getDefaultMiddleware) {
    return getDefaultMiddleware().concat(blogApi.middleware)
  }
})

// Optinal, nhưng bắt buộc nếu dùng tính năng refetchOnFocus/rèfetchOnReconnect
setupListeners(store.dispatch)

// lấy rootState và AppDispatch từ store của chúng ta (phục vụ cho vấn đề typeScript thôi)
export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

// khi nào ta sử dụng useAppDispatch này khi chúng ta dispatch 1 cái AsyncThunk, khi ta dispatch những action thông thường thì ta sử dụng useDispatch thông thường
// useAppDispatch thực ra chính là useDispatch thôi, nhưng ta cấu hình tý xíu về type kiểu dữ liệu cho nó cho khỏi báo lỗi
export const useAppDispatch = () => useDispatch<AppDispatch>()
