import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
//* Phương pháp 'type predicate' dùng để thu hẹp kiểu của một biến
// Đầu tiên chúng ta sẽ khai báo một function check kiểm tra cấu trúc về mặt logic javascript
// Tiếp theo chúng ta thêm `parameterName is Type` làm kiểu return của function thay vì boolean
// Khi dùng function kiểu tra kiểu này, ngoài việc kiểm tra về mặc logic cấu trúc, nó còn chuyển kiểu.

//* Thu hẹp một error có kiểu ko xác định về 'FetchBaseQueryError'
// mình muốn sau khi chạy xong function này, error sẽ có kiểu là 'FetchBaseQueryError'
export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  // error !== null bởi vì khi typeof null nó cũng là object
  // error là một object có thuộc tính status bên trong
  return typeof error === 'object' && error !== null && 'status' in error
}

//* Thu hẹp một error có kiểu ko xác định về một object với thuộc tính massage: string (SerializableError)
// mình muốn sau khi chạy xong function này, error sẽ có massage là string
export function isErrorWithMessage(error: unknown): error is { message: string } {
  // error !== null bởi vì khi typeof null nó cũng là object
  // message phải là string
  return typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string'
}

//* Thu hẹp một error có kiểu không xác định về lỗi liên quan đến POST, PUT không đúng field (EntityError)

// Kiểu ErrorFormObject dành cho trường hợp bao quát
interface ErrorFormObject {
  [key: string | number]: string | ErrorFormObject | ErrorFormObject[]
}
interface EntityError {
  status: 422
  data: {
    error: ErrorFormObject
  }
}

export function isEntityError(error: unknown): error is EntityError {
  // !(error.data instanceof Array) check error ko phải là array
  return (
    isFetchBaseQueryError(error) &&
    error.status === 422 &&
    typeof error.data === 'object' &&
    error.data !== null &&
    !(error.data instanceof Array)
  )
}
