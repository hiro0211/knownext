"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import dayjs from "dayjs"
import Loading from "@/app/loading" // 既存のLoadingコンポーネントをimport
import { Button } from "@/components/ui/button"

type PostDetailProps = {
  post: {
    id: number
    title: string
    content: string
    image_path: string | null
    created_at: string
    user?: {
      id: string
      email: string
    }
  }
}

export default function PostDetail({ post }: PostDetailProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // 現在ログイン中のユーザーIDを取得
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setSessionUserId(data.user?.id ?? null)
    }
    fetchUser()
  }, [])

  // 投稿者本人かどうかを判定
  const isAuthor = sessionUserId === post.user?.id

  // 日付のフォーマット
  const formattedDate = dayjs(post.created_at).format("YYYY/MM/DD HH:mm")

  // 記事削除
  const handleDelete = async () => {
    setLoading(true)
    setMessage("")
    const { error } = await supabase
      .from("Posts")
      .delete()
      .eq("id", post.id)

    if (error) {
      setMessage("記事の削除に失敗しました: " + error.message)
      setLoading(false)
      return
    }

    setMessage("記事を削除しました。")
    setLoading(false)
    // 2秒後にトップページへリダイレクト
    setTimeout(() => {
      router.push("/")
    }, 2000)
  }

  return (
    <div className="relative">
      {/* ローディングアニメーション */}
      {loading && <Loading />}

      {/* メッセージ表示 */}
      {message && (
        <div className="text-center text-sm text-red-500 my-5">{message}</div>
      )}

      {/* タイトル・本文など */}
      <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
      <div className="text-sm text-gray-500 mb-4">
        {post.user?.email} | {formattedDate}
      </div>

      {/* 画像表示 */}
      {post.image_path ? (
        <img
          src={post.image_path}
          alt={post.title}
          className="w-full h-auto mb-4 rounded-md"
        />
      ) : (
        <div className="w-full h-40 bg-gray-200 mb-4 rounded-md flex items-center justify-center">
          <span className="text-gray-500">No Image</span>
        </div>
      )}

      <p className="mb-6 whitespace-pre-line">{post.content}</p>

      {/* 投稿者のみ削除ボタンを表示 */}
      {isAuthor && (
        <Button
          onClick={handleDelete}
          className="bg-red-500 text-white hover:bg-red-600"
        >
          記事を削除
        </Button>
      )}
    </div>
  )
}
