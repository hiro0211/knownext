"use client"

import React, { useState, FormEvent } from "react"
import dayjs from "dayjs"
import { supabase } from "@/lib/supabaseClient"
import Loading from "@/app/loading"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type CommentType = {
  id: number
  content: string
  created_at: string
  user?: {
    id: string
    email: string
  }
}

type CommentSectionProps = {
  postId: number
  initialComments: CommentType[]
}

export default function CommentSection({
  postId,
  initialComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentType[]>(initialComments)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // コメント投稿ハンドラ
  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    // ログイン中のユーザーIDを取得
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id

    if (!userId) {
      setMessage("ログインが必要です。")
      setLoading(false)
      return
    }

    // コメントINSERT
    const { data, error } = await supabase
      .from("Comments")
      .insert({
        content,
        post_id: postId,
        user_id: userId,
      })
      // コメント挿入後、JOIN情報も含めて返してほしい場合
      .select("*, user:Users(email, id)")
      .single()

    if (error) {
      setMessage("コメントの投稿に失敗しました: " + error.message)
      setLoading(false)
      return
    }

    // 成功したらローカルのコメント一覧に追加
    setComments((prev) => [...prev, data])
    setContent("")
    setLoading(false)
  }

  return (
    <div className="relative mt-8">
      {loading && <Loading />}
      {message && (
        <div className="text-center text-sm text-red-500 my-5">{message}</div>
      )}

      <h2 className="text-xl font-bold mb-4">Comments</h2>

      {/* コメント投稿フォーム */}
      <form onSubmit={handleAddComment} className="mb-6">
        <Textarea
          placeholder="コメントを入力"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button type="submit" className="mt-2 bg-blue-400">
          コメント投稿
        </Button>
      </form>

      {/* コメント一覧 */}
      <div className="space-y-4">
        {comments.length === 0 && (
          <div className="text-gray-500">まだコメントはありません</div>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="border p-3 rounded-md">
            <div className="text-sm text-gray-500 flex justify-between">
              <span>{comment.user?.email || "Unknown User"}</span>
              <span>
                {dayjs(comment.created_at).format("YYYY/MM/DD HH:mm")}
              </span>
            </div>
            <p className="mt-2 text-sm">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
