"use client"

import React from "react"
import Post from "./Post"

// DBのPostsテーブルの型に合わせて定義
type PostType = {
  id: number
  user_id: string
  title: string
  content: string
  image_path: string | null
  created_at: string
  updated_at: string
}

interface PostListProps {
  posts: PostType[]
}

export default function PostList({ posts }: PostListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  )
}
