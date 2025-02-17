"use client"

// データが存在しないときの画面
const NotFound = () => {
  return (
    <div>
      <div className="text-center text-5xl font-bold mb-3">404</div>
      <div className="text-center text-xl font-bold">指定のページは存在しません。</div>
    </div>
  )
}

export default NotFound