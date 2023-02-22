import {
  createAction,
  createReducer,
  current,
  nanoid,
  PayloadAction,
  createSlice,
  createAsyncThunk,
  AsyncThunk
} from '@reduxjs/toolkit'
import { initalPostList } from '../../constants/blog'
import { Post } from '../../types/blog.type'
import http from '../../utils/http'

interface BlogState {
  postList: Post[]
  editingPost: Post | null
  loading: boolean
  currentRequestId: undefined | string
}

const initialState: BlogState = {
  postList: [],
  editingPost: null,
  loading: false,
  currentRequestId: undefined
}

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>

type PendingAction = ReturnType<GenericAsyncThunk['pending']>
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>

// * Khi sử dụng createAsyncThunk ta dùng ở extraReducers bởi vì dùng reducers nó generate ra cho bạn cái action đâu có sử dụng action đó vào việc gì đâu cho nên sử dụng extraReducers
// khi dùng reducer thì em không cần phải tạo action vì nó tự sinh ra. còn dùng createasyncthunk thì nghĩa là ta có action rồi, vậy nên ta dùng extra
// _ báo cho typescript biết là có khai báo mà ko sử dụng gì hết

export const getPostList = createAsyncThunk('blog/getPostList', async (_, thunkAPI) => {
  const response = await http.get<Post[]>('posts', {
    signal: thunkAPI.signal
  })
  return response.data
})

export const addPost = createAsyncThunk('blog/addPost', async (body: Omit<Post, 'id'>, thunkAPI) => {
  const response = await http.post<Post>('posts', body, {
    signal: thunkAPI.signal
  })
  return response.data
})

export const updatePost = createAsyncThunk(
  'blog/updatePost',
  async ({ postId, body }: { postId: string; body: Post }, thunkAPI) => {
    try {
      const response = await http.put<Post>(`posts/${postId}`, body, {
        signal: thunkAPI.signal
      })
      return response.data
    } catch (error: any) {
      if (error.name === 'AxiosError' && error.response.status === 422) {
        return thunkAPI.rejectWithValue(error.response.data)
      }
      throw error
    }
  }
)

export const deletePost = createAsyncThunk('blog/deletePost', async (postId: string, thunkAPI) => {
  const response = await http.delete<Post>(`posts/${postId}`, {
    signal: thunkAPI.signal
  })
  return response.data
})

const blogSlice = createSlice({
  name: 'blog',
  initialState,

  // reducers chỉ chấp nhận map object thôi để nó tự generate ra action
  // còn ko muốn sử dụng map object, dùng builderCallback thì sử dụng extraReducers khi đấy nó ko generate ra action
  // reducers chỉ đc xử lý đồng bộ thôi (không xử lý đc bất đồng bộ)
  reducers: {
    // deletePost: (state, action: PayloadAction<string>) => {
    //   const postId = action.payload
    //   const foundPostIndex = state.postList.findIndex((post) => post.id === postId)
    //   if (foundPostIndex !== -1) {
    //     state.postList.splice(foundPostIndex, 1)
    //   }
    // },
    startEditingPost: (state, action: PayloadAction<string>) => {
      const postId = action.payload
      // find trả về giá trị, findIndex trả về chỉ mục
      const foundPost = state.postList.find((post) => post.id === postId) || null
      state.editingPost = foundPost
    },
    cancelEditingPost: (state) => {
      state.editingPost = null
    }
    // finishEditingPost: (state, action: PayloadAction<Post>) => {
    //   const postId = action.payload.id
    //   state.postList.some((post, index) => {
    //     if (post.id === postId) {
    //       state.postList[index] = action.payload
    //       return true
    //     }
    //     return false
    //   })
    //   state.editingPost = null
    // }
    // return sử dụng dấu ()
    // addPost: {
    //   reducer: (state, action: PayloadAction<Post>) => {
    //     const post = action.payload
    //     state.postList.push(post)
    //   },
    //   prepare: (post: Omit<Post, 'id'>) => ({
    //     payload: {
    //       ...post,
    //       id: nanoid()
    //     }
    //   })
    // }
  },
  extraReducers(builder) {
    builder
      .addCase(getPostList.fulfilled, (state, action) => {
        state.postList = action.payload
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.postList.push(action.payload)
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.postList.find((post, index) => {
          if (post.id === action.payload.id) {
            state.postList[index] = action.payload
            return true
          }
          return false
        })
        state.editingPost = null
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        // meta.arg lấy tham số đầu tiên của action
        const postId = action.meta.arg
        const deletePostIndex = state.postList.findIndex((post) => post.id === postId)
        if (deletePostIndex !== -1) {
          state.postList.splice(deletePostIndex, 1)
        }
      })
      .addMatcher<PendingAction>(
        // action.type có kết thúc là pending
        (action) => action.type.endsWith('/pending'),
        // thì nhảy vào đây xử lý
        (state, action) => {
          // console.log(current(state))
          state.loading = true
          // khi ta gọi createAsyncThunk thì createAsyncThunk sinh ta 1 requestId unique(không trùng bất kỳ ai hết cho dù gọi 2 lần thì nó sẽ sinh ra 2 requestId khác nhau)
          state.currentRequestId = action.meta.requestId
        }
      )
      .addMatcher<FulfilledAction>(
        (action) => action.type.endsWith('/fulfilled'),
        (state, action) => {
          // kiểm tra cái ông này đang pending lúc nãy
          if (state.loading && state.currentRequestId === action.meta.requestId) {
            state.loading = false
            state.currentRequestId = undefined
          }
        }
      )
      .addMatcher<RejectedAction>(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          // khi api gọi 2 lần thì nó abort thằng đầu tiên nên là nó bị rejected phải thêm một requestId nữa để xem thử ta đang thực hiện ở id nào dựa vào đấy để setLoading
          if (state.loading && state.currentRequestId === action.meta.requestId) {
            state.loading = false
            state.currentRequestId = undefined
          }
        }
      )
      .addDefaultCase((state, action) => {
        console.log('action type', current(state))
      })
  }
})

// export const { addPost, deletePost, cancelEditingPost, finishEditingPost, startEditingPost } = blogSlice.actions

export const { cancelEditingPost, startEditingPost } = blogSlice.actions
const blogReducer = blogSlice.reducer
export default blogReducer
