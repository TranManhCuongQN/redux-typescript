import { createAction, createReducer, current, nanoid, PayloadAction } from '@reduxjs/toolkit'
import { initalPostList } from '../../constants/blog'
import { Post } from '../../types/blog.type'

interface BlogState {
  postList: Post[]
  editingPost: Post | null
}

const initalState: BlogState = {
  postList: initalPostList,
  editingPost: null
}

// type: blog/addPost
// <> generic
// export const addPost = createAction<Post>('blog/addPost')
export const addPost = createAction('blog/addPost', function (post: Omit<Post, 'id'>) {
  return {
    payload: {
      ...post,
      id: nanoid()
    }
  }
})
export const deletePost = createAction<string>('blog/deletePost')
export const startEditingPost = createAction<string>('blog/startEditingPost')
export const cancelEditingPost = createAction('blog/cancelEditingPost')
export const finishEditingPost = createAction<Post>('blog/finishEditingPost')

//* builderCallback này là nơi chúng ta sẽ xử lý những action và cập nhật state trong này
const blogReducer = createReducer(initalState, (builder) => {
  builder
    .addCase(addPost, (state, action) => {
      const post = action.payload
      state.postList.push(post)
    })
    .addCase(deletePost, (state, action) => {
      const postId = action.payload
      const foundPostIndex = state.postList.findIndex((post) => post.id === postId)
      if (foundPostIndex !== -1) {
        state.postList.splice(foundPostIndex, 1)
      }
    })
    .addCase(startEditingPost, (state, action) => {
      const postId = action.payload
      // find trả về giá trị, findIndex trả về chỉ mục
      const foundPost = state.postList.find((post) => post.id === postId) || null
      state.editingPost = foundPost
    })
    .addCase(cancelEditingPost, (state, action) => {
      state.editingPost = null
    })
    .addCase(finishEditingPost, (state, action) => {
      const postId = action.payload.id
      state.postList.some((post, index) => {
        if (post.id === postId) {
          state.postList[index] = action.payload
          return true
        }
        return false
      })
      state.editingPost = null
    })
    // addMatcher() cho phép ta truyền 1 "matcher function" khi "matcher function" return true thì nó chạy case của chúng ta
    // addDefaultCase() khi nó ko nhảy vào những cái case này thì nó sẽ nhảy vào DefaultCase
    .addMatcher(
      (action) => action.type.includes('cancel'),
      (state, action) => {
        // Vấn đề tại sao nó log ra proxi, sở dĩ cái state này trong immerJS gọi là draft state (có nghĩa là state nháp). Chúng ta thao tác khu vực này là chúng ta đang thao tác trên 1 state nháp của immerJS nên muốn log ra đc thì ta phải sử dụng thêm 1 function bổ trợ nữa có tên là current
        // console.log(state)
        console.log(current(state))
      }
    )
})

// * Cách viết "Map Object" ko dùng ổn với TypeScript bởi vì type action truyển thành any hết. Nên muốn có type cho action thì phải khai báo thêm
// createReducer() nhận vào tham số đầu tiên là initialState, tham số thứ 2 là Map Object, tham số thứ 3 là cái Array (cái Array này nó chứa matcher của ta)
// const blogReducer = createReducer(
//   initalState,
//   {
//     [addPost.type]: (state, action: PayloadAction<Post>) => {
//       const post = action.payload
//       state.postList.push(post)
//     },
//     [deletePost.type]: (state, action) => {
//       const postId = action.payload
//       const foundPostIndex = state.postList.findIndex((post) => post.id === postId)
//       if (foundPostIndex !== -1) {
//         state.postList.splice(foundPostIndex, 1)
//       }
//     },
//     [startEditingPost.type]: (state, action) => {
//       const postId = action.payload
//       const foundPost = state.postList.find((post) => post.id === postId) || null
//       state.editingPost = foundPost
//     },
//     [cancelEditingPost.type]: (state, action) => {
//       state.editingPost = null
//     },
//     [finishEditingPost.type]: (state, action) => {
//       const postId = action.payload.id
//       state.postList.some((post, index) => {
//         if (post.id === postId) {
//           state.postList[index] = action.payload
//           return true
//         }
//         return false
//       })
//       state.editingPost = null
//     }
//   },
//   [
//     {
//       matcher: ((action: any) => action.type.includes('cancel')) as any,
//       reducer(state, action) {
//         console.log(current(state))
//       }
//     }
//   ],
//   // defaultCase
//   (state) => {
//     console.log(state)
//   }
// )

export default blogReducer
