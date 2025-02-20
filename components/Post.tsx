"use client"

import React from "react"

type PostProps = {
  post: {
    id: number
    user_id: string
    title: string
    content: string
    image_path: string | null
    created_at: string
    updated_at: string
  }
}

export default function Post({ post }: PostProps) {
  const category = "Category"
  const author = "Author"
  const createdTime = new Date(post.created_at).toLocaleDateString()

  return (
    <div className="border rounded-md p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* 画像 */}
      {post.image_path ? (
        <img
          src={post.image_path}
          alt={post.title}
          className="w-full h-40 object-cover mb-4 rounded-md"
        />
      ) : (
        <div className="w-full h-40 bg-gray-200 mb-4 rounded-md flex items-center justify-center">
          <span className="text-gray-500">No Image</span>
        </div>
      )}

      {/* タイトル */}
      <h2 className="font-bold text-lg mb-1">{post.title}</h2>

      {/* 投稿者とカテゴリ */}
      <div className="text-sm text-gray-500 flex items-center justify-between mb-2">
        <span>{author}</span>
      </div>

      {/* 投稿日時 */}
      <div className="text-xs text-gray-400 mb-2">
        {createdTime}
      </div>

      {/* 本文（ダミー表示・抜粋など） */}
      <p className="text-sm text-gray-700 line-clamp-2">
        {post.content}
      </p>
    </div>
  )
}
