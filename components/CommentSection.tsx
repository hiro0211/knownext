"use client"

import React, { useState, FormEvent } from "react"
import dayjs from "dayjs"
import { supabase } from "@/lib/supabaseClient"
import Loading from "@/app/loading"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Mail, CalendarClock, MessageSquare, Send } from "lucide-react"

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
    
    if (!content.trim()) {
      setMessage("コメントを入力してください")
      return
    }
    
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
        content: content.trim(),
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
      
      <div className="flex items-center space-x-2 mb-6">
        <MessageSquare className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-bold">コメント</h2>
      </div>
      
      {message && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm mb-4 flex items-center">
          <span>{message}</span>
        </div>
      )}

      {/* コメント投稿フォーム */}
      <form onSubmit={handleAddComment} className="mb-8">
        <Textarea
          placeholder="コメントを入力してください..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-24 focus:border-blue-300 transition-colors"
        />
        <div className="flex justify-end mt-2">
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 transition-colors flex items-center space-x-2"
            disabled={loading || !content.trim()}
          >
            <Send className="h-4 w-4" />
            <span>コメント投稿</span>
          </Button>
        </div>
      </form>

      {/* コメント一覧 */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-gray-500 border border-gray-200 bg-gray-50 rounded-md p-6 text-center">
            <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p>まだコメントはありません</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border border-gray-200 p-4 rounded-md hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="flex flex-wrap justify-between items-center mb-3 pb-2 border-b border-gray-100">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate max-w-[200px]">{comment.user?.email || "Unknown User"}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <CalendarClock className="h-4 w-4" />
                  <span>{dayjs(comment.created_at).format("YYYY/MM/DD HH:mm")}</span>
                </div>
              </div>
              <p className="text-sm whitespace-pre-line">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}