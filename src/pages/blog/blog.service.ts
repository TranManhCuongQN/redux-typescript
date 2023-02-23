import { addPost } from './../../../../old-local-blog/src/pages/blog/blog.reducer'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Post } from '../../types/blog.type'

// Nếu bên slice chúng ta dùng createSlice để tạo slice thì bên RTK Query chúng ta dùng createApi
// Với createAPI chúng ta gọi là slice api
// Chúng ta sẽ khai báo baseURL và các endpoint

export const blogApi = createApi({
  reducerPath: 'blogApi', // Tên field trong Redux state
  tagTypes: ['Posts'], // Những kiểu tag cho phép dùng trong blogApi

  // fetchBaseQuery là một function nhỏ được xây dựng trên fetch API
  // baseQuery được dùng cho mỗi endpoint để fetch api
  // Nó không thay thế hoàn toàn được axios nhưng sẽ giải quyết được hầu hết các vấn đề của bạn
  // Chúng ta có thể sử dụng axios thay thế cũng đc, nhưng để sau nhé.
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:4000/' }),

  // endPoints là tập hợp những method giúp get, post, put, delete,... tương tác với server
  // khi khai báo endPoints nó sẽ sinh ra cho chúng ta các hook tương ứng để dùng trong component
  // endpoints có 2 kiểu là query và mutation

  endpoints: (build) => ({
    // Generic type theo thứ tự là kiểu response trả về và argument (đối số truyền vào)
    // Query: thường dùng cho GET
    getPosts: build.query<Post[], void>({
      query: () => 'posts', // method ko có argument
      providesTags(result) {
        // Cái callback providesTags này sẽ phải chạy mỗi khi getPosts chạy
        // Mong muốn là sẽ return về một mảng kiểu
        // ```ts
        // interface Tags :{
        // type: 'Posts',      // tên trùng với tagTypes ở trên
        // id: string,
        // }[]
        // ```
        // Vì thế phải thêm as const vào để báo hiệu type là Read only, không thể mutate
        if (result) {
          // result nó sẽ trả về 2 loại là undefined và mảng Post
          // tại sao phải thêm 'Posts' as const bởi vì javaSctipt nó hiểu type: 'Posts' là string chứ ko phải type là 1 'Posts'
          const final = [
            ...result.map(({ id }) => ({
              type: 'Posts' as const,
              id
            })),
            { type: 'Posts' as const, id: 'LIST' }
          ]
          return final
        }
        const final = [{ type: 'Posts' as const, id: 'LIST' }]
        return final
      }
    }),

    // Mutation: thường dùng cho các trường hợp thay đổi dữ liệu trên server như: POST, PUT, DELETE
    // Post là response trả về và Omit<Post, 'id'> là body gửi lên
    addPost: build.mutation<Post, Omit<Post, 'id'>>({
      query(body) {
        return {
          url: 'posts',
          method: 'POST',
          body
        }
      },
      // invalidatesTags cung cấp các tag để báo hiệu cho những method nào có providesTags
      // match với nó sẽ bị gọi lại
      // trong trường hợp này getPosts sẽ chạy lại
      // khi mình addPost add thành công thì ông invalidatesTags này, ổng chạy và return cho mình một cái array [{type: 'Posts', id: 'LIST'}] và cái này nó trong  providesTags kiểu gì nó cũng trả về [{type: 'Posts', id: 'LIST'}] (trong cả 2 trường hợp có result và không có result thì nó cũng trả về như trên) nên kiểu gì mình addPost thành công providesTags cũng bị match. Khi providesTags match với bất kỳ invalidatesTags thì providesTags này sẽ làm cho getPosts gọi lại. Khi getPosts gọi lại thì nó cập nhật lại redux state.
      // LIST là cái tên mình đặt tên gì cũng đc
      invalidatesTags: (result, error, body) => [
        {
          type: 'Posts',
          id: 'LIST'
        }
      ]
    }),

    // get theo id
    getPostId: build.query<Post, string>({
      query: (id) => `posts/${id}`
    }),
    updatePost: build.mutation<Post, { id: string; body: Post }>({
      query(data) {
        return {
          url: `posts/${data.id}`,
          method: 'PUT',
          body: data.body
        }
      },

      // chúng ta cập nhật 1 bài Post thì ta biết id của bài đó. Trong những trường hợp mình cập nhật bài Post này rồi, biết đc id rồi thì mình cũng có thể điều khiển đc làm cho getPosts thằng nào đấy gọi lại thông qua id. Trong những trường hợp ko có id thì truyền vào LIST
      invalidatesTags: (result, error, data) => [
        {
          type: 'Posts',
          id: data.id
        }
      ]
    }),
    deletePost: build.mutation<{}, string>({
      query(id) {
        return {
          url: `posts/${id}`,
          method: 'DELETE'
        }
      },
      invalidatesTags: (result, error, id) => [
        {
          type: 'Posts',
          id: id
        }
      ]
    })
  })
})

export const { useGetPostsQuery, useAddPostMutation, useGetPostIdQuery, useUpdatePostMutation, useDeletePostMutation } =
  blogApi
