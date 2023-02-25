## Mô hình sync dữ liệu danh sách bài Post dưới local sau khi thêm 1 bài post

- Thường sẽ có 2 cách tiếp cận

## Cách 1:

- 1. Sau khi thêm 1 bài post thì server trả về data của bài post đó.
- 2. Chúng ta sẽ tiến hành lấy data đó thêm vào state redux
- 3. Lúc này UI chúng ta sẽ đc sync
-
- => Rủi ro cách này là nếu khi gọi request add post mà server trả về data không đủ các
- field để chúng ta hiển thị thì sẽ gặp lỗi. Nếu có nhiều người cùng add post thì data
- sync thiếu, chưa kể chúng ta phải quản lý việc cập nhật state nữa, hơi mệt.
-
-

## Cách 2: Đây là cách thường dùng với RTK query

- 1. Sau khi thêm 1 bài post thì server sẽ trả về data của bài post đó.
- 2. Chúng ta sẽ tiến hành fetch lại API get post để cập nhật state redux
- 3. Lúc này UI chúng ta sẽ đc sync.
-
- ====> Cách này giúp data dưới local sẽ luôn mới nhất, luôn đồng bộ với server
- ====> Khuyết điểm là chúng ta sẽ tốn thêm 1 lần gọi API. Thực ra điều này có thể chấp nhận đc

## Quy ước lỗi trả về từ server

Server phải trả về một lỗi thống nhất, không thể trả tùy tiện về được.

Ở đây server của mình (JSON Server) cấu hình để trả về 2 kiểu lỗi.

1. Lỗi liên quan đến việc gửi data như POST, PUT thì error là một object kiểu `EntityError`

```ts
{
  "error":{
    "publishData":"Không được publish vào thời điểm trong quá khứ"
  }
}
```

```ts
interface EntityError {
  [key: string | number]: string | EntityError | EntityError[]
}
```

Có thể nâng cao hơn `key: string` là `key: object` hoặc `key: array` nếu form phức tạp

2. Các lỗi còn lại sẽ trả về một thông báo dạng `error: string`

```ts
{
  "error":"Không tìm thấy bài post"
}
```

## Lỗi từ RTK Query

Sẽ có 2 kiểu: FetchBaseQueryError | SerializedError

- RTK Query sẽ trả lỗi trực tiếp cho chúng ta nếu lỗi không mong đợi do người dùng throw ra. Nó sẽ transform thành SerializedError
- Những cái lỗi liên quan đến fetchAPI thì nó nhảy vào FetchBaseQueryError
