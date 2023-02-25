import { AnyAction, isRejectedWithValue, Middleware, MiddlewareAPI } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'

function isPayloadErrorMessage(payload: unknown): payload is {
  data: {
    error: string
  }
  status: number
} {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    typeof (payload as any).data.error === 'string'
  )
}

export const rtkQueryErrorLogger: Middleware = (api: MiddlewareAPI) => (next) => (action: AnyAction) => {
  // `isRejectedWithValue` là một function giúp chúng ta kiểm tra những action có rejectWithValue = true từ createAsynThunk
  // RTK Query sử dụng `createAsynThunk` bên trong nên chúng ta có thể dùng `isRejectedWithValue` để kiểm tra lỗi
  if (isRejectedWithValue(action)) {
    // Mỗi khi thực hiện query hoặc mutation mà bị lỗi thì nó sẽ chạy vào đây
    // Những lỗi từ server thì action nó mới rejectWithValue = true
    // Còn những lỗi liên quan đến việc catching mà bị rejected thì rejectWithValue = false nên đừng lo lắng nó ko lọt vào đâu.

    if (isPayloadErrorMessage(action.payload)) {
      // Lỗi reject từ server chỉ có message thôi
      toast.error(action.payload.data.error)
    }
  }

  return next(action)
}
