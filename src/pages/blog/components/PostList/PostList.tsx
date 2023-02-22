import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, useAppDispatch } from '../../../../store'
import http from '../../../../utils/http'
import { useGetPostsQuery } from '../../blog.service'
import { deletePost, getPostList, startEditingPost } from '../../blog.slice'
// import { deletePost, getPostList, startEditingPost } from '../../blog.slice'
import PostItem from '../PostItem'
import SkeletonPost from '../SkeletonPost'

const PostList = () => {
  // sử dụng useSelector để lấy state từ store
  // useSelector nhận vào 1 function, function này có params là 1 state, return về state muốn lấy
  const postList = useSelector((state: RootState) => state.blog.postList)
  const loading = useSelector((state: RootState) => state.blog.loading)

  // const dispatch = useDispatch()
  const dispatch = useAppDispatch()

  useEffect(() => {
    // trong thực tế cái app chúng ta có thể gọi 2 lần nên chúng ta cần xử lý việc gọi 2 lần này xử lý bằng cách gọi cleanup function này (lý do có strictMode)
    // const controller = new AbortController()
    // http
    //   .get('/posts', {
    //     signal: controller.signal
    //   })
    //   .then((res) => {
    //     console.log(res)
    //     const postListResult = res.data
    //     dispatch({
    //       type: 'blog/getPostListSuccess',
    //       payload: postListResult
    //     })
    //   })
    //   .catch((error) => {
    //     if (!(error.code === 'ERR_CANCELED')) {
    //       dispatch({
    //         type: 'blog/getPostListFailed',
    //         payload: error
    //       })
    //     }
    //   })
    // return () => {
    //   controller.abort()
    // }

    const promise = dispatch(getPostList())
    return () => {
      // cancel API
      promise.abort()
    }
  }, [])

  const handleDelete = (postId: string) => {
    dispatch(deletePost(postId))
  }

  const handleStartEditing = (postId: string) => {
    dispatch(startEditingPost(postId))
  }

  // isLoading là chỉ dành cho lần fetch đầu tiên
  // isFetching là cho mỗi lần gọi API (thường dùng isFetching còn isLoading sử dụng cho các trường hợp đặc biệt mà thôi)
  const { data, isLoading, isFetching } = useGetPostsQuery()
  console.log(data, isLoading, isFetching)

  return (
    <>
      <div className='bg-white py-6 sm:py-8 lg:py-12'>
        <div className='mx-auto max-w-screen-xl px-4 md:px-8'>
          <div className='mb-10 md:mb-16'>
            <h2 className='mb-4 text-center text-2xl font-bold text-gray-800 md:mb-6 lg:text-3xl'>Được Dev Blog</h2>
            <p className='mx-auto max-w-screen-md text-center text-gray-500 md:text-lg'>
              Đừng bao giờ từ bỏ. Hôm nay khó khăn, ngày mai sẽ trở nên tồi tệ. Nhưng ngày mốt sẽ có nắng
            </p>
          </div>
          <div className='grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-2 xl:grid-cols-2 xl:gap-8'>
            {/* {loading && (
              <>
                <SkeletonPost />
                <SkeletonPost />
              </>
            )}
            {!loading &&
              postList.map((post) => (
                <PostItem
                  post={post}
                  key={post.id}
                  handleDelete={handleDelete}
                  handleStartEditing={handleStartEditing}
                />
              ))} */}
            {isFetching && (
              <>
                <SkeletonPost />
                <SkeletonPost />
              </>
            )}
            {!isFetching &&
              postList.map((post) => (
                <PostItem
                  post={post}
                  key={post.id}
                  handleDelete={handleDelete}
                  handleStartEditing={handleStartEditing}
                />
              ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default PostList
