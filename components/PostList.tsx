"use client";

import React from "react";
import Post from "./Post";

// 投稿の型定義
type Post = {
  id: number;
  title: string;
  content: string;
  image_path: string | null;
  created_at: string;
  user?: {
    email: string;
  };
};

type PostListProps = {
  posts: Post[];
};

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-gray-500 p-6 text-center bg-gray-50 rounded-md border border-gray-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto mb-3 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="font-medium">記事がありません</p>
        <p className="text-sm mt-1">新しい記事が投稿されるとここに表示されます</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <div key={post.id} className="min-w-0 w-full">
          <Post post={post} />
        </div>
      ))}
    </div>
  );
}