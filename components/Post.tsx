"use client";

import React from "react";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image"; 
import { CalendarClock, Mail, ArrowRight } from "lucide-react";

type PostProps = {
  post: {
    id: number;
    title: string;
    content: string;
    image_path: string | null;
    created_at: string;
    user?: {
      email: string;
    };
  };
};

export default function Post({ post }: PostProps) {
  // 日付表示のフォーマット(dayjs)
  const formattedDate = dayjs(post.created_at).format("YYYY/MM/DD HH:mm");

  // 投稿者メールアドレス (JOIN済み)
  const author = post.user?.email || "Unknown User";

  return (
    <Link href={`/posts/${post.id}`} className="block">
      <div className="border rounded-md p-4 shadow-sm hover:shadow-md transition-shadow group hover:border-blue-200">
        {/* 画像がある場合 */}
        {post.image_path ? (
          <div className="relative w-full h-40 overflow-hidden rounded-md mb-4">
            <Image
              src={post.image_path}
              alt={post.title}
              fill
              className="object-cover rounded-md transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ) : (
          // 画像がない場合
          <div className="w-full h-40 bg-gray-100 mb-4 rounded-md flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            <span className="text-gray-500">No Image</span>
          </div>
        )}

        {/* タイトル */}
        <h2 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {post.title}
        </h2>

        {/* 本文 (一部だけ表示する例) */}
        <p className="text-sm text-gray-700 line-clamp-2 mb-3">{post.content}</p>

        {/* 投稿情報 */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          {/* 投稿者情報 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-500 space-x-1">
              <Mail className="h-4 w-4" />
              <span className="truncate max-w-[150px]">{author}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 space-x-1">
              <CalendarClock className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
          </div>
          
          {/* 「もっと見る」アイコン */}
          <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-sm">
            <span>詳細</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
