import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Post } from '../../types/blog.type'

// Nếu bên slice chúng ta dùng createSlice để tạo slice thì bên RTK Query chúng ta dùng createApi
// Với createAPI chúng ta gọi là slice api
// Chúng ta sẽ khai báo baseURL và các endpoint

export const blogApi = createApi({
  reducerPath: 'blogApi', // Tên field trong Redux state

  // fetchBaseQuery là một function nhỏ được xây dựng trên fetch API
  // baseQuery được dùng cho mỗi endpoint để fetch api
  // Nó không thay thế hoàn toàn được axios nhưng sẽ giải quyết được hầu hết các vấn đề của bạn
  // Chúng ta có thể sử dụng axios thay thế cũng đc, nhưng để sau nhé.
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:4000/' }),

  // endPoints là tập hợp những method giúp get, post, put, delete,... tương tác với server
  // khi khai báo endPoints nó sẽ sinh ra cho chúng ta các hook tương ứng để dùng trong component
  // endpoints có 2 kiểu là query và mutation
  // Query: thường dùng cho GET
  // Mutation: thường dùng cho các trường hợp thay đổi dữ liệu trên server như: POST, PUT, DELETE
  endpoints: (build) => ({
    // Generic type theo thứ tự là kiểu response trả về và argument (đối số truyền vào)
    getPosts: build.query<Post[], void>({
      query: () => 'posts' // method ko có argument
    })
  })
})

export const { useGetPostsQuery } = blogApi
