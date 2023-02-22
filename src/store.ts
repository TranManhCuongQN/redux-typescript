import { useDispatch } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import blogReducer from './pages/blog/blog.slice'

// function configureStore nó sẽ generate ra 1 store object
export const store = configureStore({
  reducer: { blog: blogReducer }
})

// lấy rootState và AppDispatch từ store của chúng ta (phục vụ cho vấn đề typeScript thôi)
export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

// khi nào ta sử dụng useAppDispatch này khi chúng ta dispatch 1 cái AsyncThunk, khi ta dispatch những action thông thường thì ta sử dụng useDispatch thông thường
// useAppDispatch thực ra chính là useDispatch thôi, nhưng ta cấu hình tý xíu về type kiểu dữ liệu cho nó cho khỏi báo lỗi
export const useAppDispatch = () => useDispatch<AppDispatch>()
