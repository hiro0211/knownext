"use client"

import React, { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import dayjs from "dayjs"
import toast from "react-hot-toast"

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
import { PenSquare, Upload, FileImage, X, AlertCircle, Save } from "lucide-react"

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
  user?: {
    email: string
  }
}

// propsでpostを受け取る
type EditPostFormProps = {
  post: PostType
}

export default function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(post.image_path)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  
  // 日付表示のフォーマット
  const formattedDate = dayjs(post.updated_at || post.created_at).format("YYYY/MM/DD HH:mm")

  // react-hook-form 初期化
  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: post.title || "",
      content: post.content || "",
    },
  })

  // ファイル入力欄クリック
  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  // 画像が選択された時
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setFormError(null)

    if (selectedFile) {
      // ファイルサイズチェック (2MB)
      if (selectedFile.size > 2 * 1024 * 1024) {
        setFormError("ファイルサイズは2MB以下にしてください")
        setFile(null)
        e.target.value = ""
        return
      }

      // プレビュー表示
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  // 画像削除
  const handleRemoveFile = () => {
    setFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // フォーム送信時
  const onSubmit = async (values: EditFormValues) => {
    setSubmitting(true)
    setFormError(null)
    toast.loading("更新中...")

    try {
      // ログインユーザー取得
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        toast.dismiss()
        toast.error("ログインしていません")
        setFormError("ログインが必要です。ログインページからログインしてください。")
        setSubmitting(false)
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
          toast.dismiss()
          toast.error("画像アップロードに失敗しました")
          setFormError(`画像アップロードエラー: ${uploadError.message}`)
          setSubmitting(false)
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
        toast.dismiss()
        toast.error("更新に失敗しました")
        setFormError(`更新エラー: ${updateError.message}`)
        setSubmitting(false)
        return
      }

      toast.dismiss()
      toast.success("記事を更新しました")

      // 2秒後に記事詳細ページへリダイレクト
      setTimeout(() => {
        router.push(`/posts/${post.id}`)
      }, 1500)
    } catch (err: any) {
      console.error(err)
      toast.dismiss()
      toast.error("エラーが発生しました")
      setFormError(`予期せぬエラー: ${err.message}`)
      setSubmitting(false)
    }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto mt-8 p-4">
      {submitting && <Loading />}

      <div className="flex items-center space-x-2 mb-6">
        <PenSquare className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">記事編集</h1>
      </div>

      {/* 最終更新日 */}
      <div className="text-sm text-gray-500 mb-6 flex items-center">
        <span>最終更新: {formattedDate}</span>
      </div>

      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4 mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{formError}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 画像アップロードエリア */}
          <div
            className={`border-2 border-dashed rounded-md p-6 transition-colors ${
              filePreview
                ? "border-blue-300 bg-blue-50"
                : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            {filePreview ? (
              <div className="relative">
                <img
                  src={filePreview}
                  alt="プレビュー"
                  className="max-h-48 mx-auto rounded-md"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                {file && (
                  <p className="text-sm text-center mt-2 text-gray-500">
                    {file.name} ({((file.size) / 1024).toFixed(0)}KB)
                  </p>
                )}
              </div>
            ) : (
              <div
                className="text-center cursor-pointer"
                onClick={handleFileClick}
              >
                <FileImage className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 font-medium mb-2">
                  ファイル選択またはドラッグ&ドロップ
                </p>
                <p className="text-gray-400 text-sm">
                  ファイル拡張子: jpg / jpeg / png
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  ファイルサイズ: 2MBまで
                </p>
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>ファイルを選択</span>
                  </Button>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* タイトル */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">タイトル</FormLabel>
                <FormControl>
                  <Input
                    placeholder="タイトルを入力してください"
                    className="focus:border-blue-300"
                    {...field}
                  />
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
                <FormLabel className="font-bold">内容</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="記事の内容を入力してください"
                    rows={8}
                    className="min-h-32 focus:border-blue-300 resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 更新ボタン */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 transition-colors"
            disabled={submitting}
          >
            <Save className="h-5 w-5 mr-2" />
            更新する
          </Button>
        </form>
      </Form>
    </div>
  )
}