"use client"

import React from "react"
import Post from "./Post"

// Postsテーブル + JOINしたUsersテーブル
// user: { email: string } を含む形
type PostType = {
  id: number
  title: string
  content: string
  image_path: string | null
  created_at: string
  user?: {
    email: string
  }
}

type PostListProps = {
  posts: PostType[]
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <div className="text-gray-500">記事がありません</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  )
}
