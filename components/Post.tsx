"use client"

import React from "react"
import dayjs from "dayjs"

type PostProps = {
  post: {
    id: number
    title: string
    content: string
    image_path: string | null
    created_at: string
    user?: {
      email: string
    }
  }
}

export default function Post({ post }: PostProps) {
  // 日付表示のフォーマット(dayjs)
  const formattedDate = dayjs(post.created_at).format("YYYY/MM/DD HH:mm")

  // 投稿者メールアドレス (JOIN済み)
  const author = post.user?.email || "Unknown User"

  return (
    <div className="border rounded-md p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* 画像がある場合 */}
      {post.image_path ? (
        <img
          src={post.image_path}
          alt={post.title}
          className="w-full h-40 object-cover mb-4 rounded-md"
        />
      ) : (
        // 画像がない場合
        <div className="w-full h-40 bg-gray-200 mb-4 rounded-md flex items-center justify-center">
          <span className="text-gray-500">No Image</span>
        </div>
      )}

      {/* タイトル */}
      <h2 className="font-bold text-lg mb-1">{post.title}</h2>

      {/* 投稿者 & 日付 */}
      <div className="text-sm text-gray-500 flex items-center justify-between mb-2">
        <span>{author}</span>
        <span>{formattedDate}</span>
      </div>

      {/* 本文 (一部だけ表示する例) */}
      <p className="text-sm text-gray-700 line-clamp-2">{post.content}</p>
    </div>
  )
}
