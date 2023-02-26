import { unwrapResult } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, useAppDispatch } from '../../../../store'
import { Post } from '../../../../types/blog.type'
import { isEntityError, isFetchBaseQueryError } from '../../../../utils/helpers'
import { useAddPostMutation, useGetPostIdQuery, useUpdatePostMutation } from '../../blog.service'
import { addPost, cancelEditingPost, updatePost } from '../../blog.slice'

interface ErrorForm {
  publishDate: string
}

// const initialState: Post = {
//   id: '',
//   description: '',
//   featuredImage: '',
//   publishDate: '',
//   published: false,
//   title: ''
// }

const initialState: Omit<Post, 'id'> = {
  description: '',
  featuredImage: '',
  publishDate: '',
  published: false,
  title: ''
}

// Mẹo copy các key của kiểu Omit<Post, 'id'> để làm key cho kiểu FormError
type FormError =
  | {
      // Key của chúng ta có thể là 1 trong những key của Omit<Post, 'id'> và có kiểu là string
      // [key in keyof Omit<Post, 'id'>]: string
      [key in keyof typeof initialState]: string
    }
  | null

export default function CreatePost() {
  // const [formData, setFormData] = useState<Post>(initialState)
  const [formData, setFormData] = useState<Omit<Post, 'id'> | Post>(initialState)
  const editingPost = useSelector((state: RootState) => state.blog.editingPost)
  // const [errorForm, setErrorForm] = useState<ErrorForm | null>(null)

  // giá trị đầu tiên nó return về mình 1 function đặt tên là addPost
  // giá trị thứ hai là một object result đặt tên là addPostResult
  const [addPost, addPostResult] = useAddPostMutation()
  const [updatePost, updatePostResult] = useUpdatePostMutation()

  // Mong muốn useGetPostIdQuery gọi khi có postId thôi còn ko có postId thì nó skip
  // refetch bắt nó gọi lại api
  // refetchOnMountOrArgChange: 5. Nếu component 3 bị unmount, data 3 vẫn còn vì component 4 vẫn đang subcribe. Nếu lúc này 4 unsubcribe thì data 3 mới bị xóa sau 5s
  // pollingInterval: mình xét sau 1s nó sẽ gọi lại API
  const { data, refetch } = useGetPostIdQuery(editingPost?.id as string, {
    skip: !editingPost?.id,
    refetchOnMountOrArgChange: 5,
    pollingInterval: 1000
  })

  // Lỗi có thể đến từ 'addPostResult' hoặc 'updatePostResult'
  // Vậy chúng ta sẽ dựa vào điều kiện có postId hoặc không có (tức đang trong chỗ độ edit hay không) để show lỗi.
  // Chúng ta cũng ko cần thiết phải tạo 1 state errorform
  // Vì errorform phụ thuộc vào 'addPostResult', 'updatePostResult' và 'postId' nên có thể dùng một biến để tính toán

  // dùng useMemo để đỡ tính toán nhiều lần
  const errorForm: FormError = useMemo(() => {
    const errorResult = editingPost?.id ? updatePostResult.error : addPostResult.error

    // Vì errorResult có thể là FetchBaseQueryError | SerializedError | undefined, mỗi kiểu có cấu trúc khác nhau nên chúng ta cần kiểm tra để hiển thị cho đúng.

    if (isEntityError(errorResult)) {
      // Có thể ép kiểu một cách an toàn chỗ này, vì chúng ta đã kiểm tra chắc chắn rồi.
      // Nếu ko muốn ép kiểu thì có thể khai báo interface `EntityError` sao cho data.errors tương đồng với FormError là đc

      console.log('errorResult', errorResult)
      return errorResult.data.error as FormError
    }

    // return null bởi vì muốn xử lý các lỗi liên quan đến Entity Error trong component thôi, còn những lỗi trả về mesage: string thì cho toast lên thì xử lý ở middleware
    return null
  }, [editingPost?.id, updatePostResult, addPostResult])

  useEffect(() => {
    // setFormData(editingPost || initialState)
    if (data) {
      setFormData(data)
    }
    // }, [editingPost])
  }, [data])

  const dispatch = useAppDispatch()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // if (editingPost) {
    //   // bình thường khi ta dispatch một asyncThunk thì nó sẽ đóng gói nên sử dụng unwrap để mở gói
    //   dispatch(updatePost({ postId: editingPost.id, body: formData }))
    //     .unwrap()
    //     .then((res) => {
    //       setFormData(initialState)
    //       if (errorForm) {
    //         setErrorForm(null)
    //       }
    //     })
    //     .catch((error) => {
    //       setErrorForm(error.error)
    //       console.log(error)
    //     })
    // } else {
    //   // const formDateWithId = { ...formData, id: new Date().toISOString() }
    //   try {
    //     const formDateWithId = { ...formData }
    //     // khi dispatch action addPost thì reducer nó sẽ checking nó nhận thấy đc có 1 action dispatch rồi nên chúng case nào thì xử lý case đó
    //     const res = await dispatch(addPost(formDateWithId))

    //     // Muốn bắt lấy lỗi hoặc data từ disptach trả về thì phải unwrapResult
    //     unwrapResult(res)
    //     setFormData(initialState)
    //   } catch (error) {}
    // }

    if (editingPost) {
      await updatePost({
        id: editingPost.id,
        body: formData as Post
      }).unwrap()
      setFormData(initialState)
    } else {
      const result = await addPost(formData).unwrap()
      setFormData(initialState)
    }
  }

  const handleCancelEditingPost = () => {
    dispatch(cancelEditingPost())
  }

  return (
    <form onSubmit={handleSubmit} onReset={handleCancelEditingPost}>
      <button
        className='group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 p-0.5 text-sm font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 group-hover:from-purple-600 group-hover:to-blue-500 dark:text-white dark:focus:ring-blue-800'
        type='button'
        onClick={() => refetch()}
      >
        <span className='relative rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-900'>
          Publish Post
        </span>
      </button>
      <div className='mb-6'>
        <label htmlFor='title' className='mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300'>
          Title
        </label>
        <input
          type='text'
          id='title'
          className='block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500'
          placeholder='Title'
          required
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
        />
      </div>
      <div className='mb-6'>
        <label htmlFor='featuredImage' className='mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300'>
          Featured Image
        </label>
        <input
          type='text'
          id='featuredImage'
          className='block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500'
          placeholder='Url image'
          required
          value={formData.featuredImage}
          onChange={(e) => setFormData((prev) => ({ ...prev, featuredImage: e.target.value }))}
        />
      </div>
      <div className='mb-6'>
        <div>
          <label htmlFor='description' className='mb-2 block text-sm font-medium text-gray-900 dark:text-gray-400'>
            Description
          </label>
          <textarea
            id='description'
            rows={3}
            className='block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500'
            placeholder='Your description...'
            required
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          ></textarea>
        </div>
      </div>
      <div className='mb-6'>
        <label
          htmlFor='publishDate'
          className={`mb-2 block text-sm font-medium  dark:text-gray-300 ${
            errorForm?.publishDate ? 'text-red-700' : 'text-gray-900'
          }`}
        >
          Publish Date
        </label>
        <input
          type='datetime-local'
          id='publishDate'
          className={`block w-56 rounded-lg border  p-2.5 text-sm focus:outline-none ${
            errorForm?.publishDate
              ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500  focus:ring-blue-500'
          }`}
          placeholder='Title'
          required
          value={formData.publishDate}
          onChange={(e) => setFormData((prev) => ({ ...prev, publishDate: e.target.value }))}
        />
        {errorForm?.publishDate && (
          <p className='mt-2 text-sm text-red-600'>
            <span className='font-medium'>Lỗi! </span>
            {errorForm.publishDate}
          </p>
        )}
      </div>
      <div className='mb-6 flex items-center'>
        <input
          id='publish'
          type='checkbox'
          className='h-4 w-4 focus:ring-2 focus:ring-blue-500'
          checked={formData.published}
          onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
        />
        <label htmlFor='publish' className='ml-2 text-sm font-medium text-gray-900'>
          Publish
        </label>
      </div>
      <div>
        {editingPost && (
          <>
            <button
              type='submit'
              className='group relative mb-2 mr-2 inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-teal-300 to-lime-300 p-0.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-4 focus:ring-lime-200 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 dark:focus:ring-lime-800'
            >
              <span className='relative rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-900'>
                Update Post
              </span>
            </button>
            <button
              type='reset'
              className='group relative mb-2 mr-2 inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 p-0.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-4 focus:ring-red-100 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 dark:focus:ring-red-400'
            >
              <span className='relative rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-900'>
                Cancel
              </span>
            </button>
          </>
        )}
        {!editingPost && (
          <button
            className='group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 p-0.5 text-sm font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 group-hover:from-purple-600 group-hover:to-blue-500 dark:text-white dark:focus:ring-blue-800'
            type='submit'
          >
            <span className='relative rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-900'>
              Publish Post
            </span>
          </button>
        )}
      </div>
    </form>
  )
}
