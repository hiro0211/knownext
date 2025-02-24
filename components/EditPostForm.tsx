"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { supabase } from "@/lib/supabaseClient"
import Loading from "@/app/loading"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

// バリデーションルール (タイトル必須、内容必須)
const editSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  content: z.string().min(1, "内容は必須です"),
})

type EditFormValues = z.infer<typeof editSchema>

// Postの型
type PostType = {
  id: number
  user_id: string
  title: string
  content: string
  image_path: string | null
  created_at: string
  updated_at: string
}

// propsでpostを受け取る
type EditPostFormProps = {
  post: PostType
}

export default function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [file, setFile] = useState<File | null>(null)

  // react-hook-form 初期化
  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: post.title || "",
      content: post.content || "",
    },
  })

  // 画像変更があればFileオブジェクトをセット
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    } else {
      setFile(null)
    }
  }

  // フォーム送信時
  const onSubmit = async (values: EditFormValues) => {
    setLoading(true)
    setMessage("")

    try {
      // ログインユーザー取得
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        setMessage("ログインしていません。")
        setLoading(false)
        return
      }

      // 画像を新しくアップロードする場合のみ、Storageにアップロード
      let imagePath = post.image_path // 既存の画像を維持
      if (file) {
        const fileExt = file.name.split(".").pop()
        const fileName = `${user.id}_${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(`posts/${fileName}`, file, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          setMessage(`画像アップロードに失敗しました: ${uploadError.message}`)
          setLoading(false)
          return
        }

        // 新しい画像URLに更新
        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(`posts/${fileName}`)
        imagePath = publicUrl
      }

      // PostsテーブルをUPDATE
      const { error: updateError } = await supabase
        .from("Posts")
        .update({
          title: values.title,
          content: values.content,
          image_path: imagePath,
        })
        .eq("id", post.id)

      if (updateError) {
        setMessage(`更新に失敗しました: ${updateError.message}`)
        setLoading(false)
        return
      }

      setMessage("記事を更新しました。")
      setLoading(false)

      // 2秒後に記事詳細ページへリダイレクト
      setTimeout(() => {
        router.push(`/posts/${post.id}`)
      }, 2000)
    } catch (err: any) {
      console.error(err)
      setMessage(`エラーが発生しました: ${err.message}`)
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {/* ローディング */}
      {loading && <Loading />}

      {/* メッセージ */}
      {message && (
        <div className="text-center text-sm text-red-500 my-5">{message}</div>
      )}

      <h1 className="text-2xl font-bold mb-6">記事編集</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 画像アップロード (任意) */}
          <div className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center mb-4">
            <p className="mb-2 text-gray-500">
              ファイル選択またはドラッグ&ドロップ
            </p>
            <p className="mb-2 text-gray-400 text-sm">
              ファイル拡張子: jpg / jpeg / png
            </p>
            <p className="mb-2 text-gray-400 text-sm">ファイルサイズ: 2MBまで</p>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-2"
            />
          </div>

          {/* タイトル */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>タイトル</FormLabel>
                <FormControl>
                  <Input placeholder="タイトルを入力" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 内容 */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>内容</FormLabel>
                <FormControl>
                  <Textarea placeholder="記事の内容を入力" rows={5} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 更新ボタン */}
          <Button type="submit" className="w-full bg-blue-600 text-white">
            更新
          </Button>
        </form>
      </Form>
    </div>
  )
}
