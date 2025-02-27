"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast";
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

// バリデーションルール (タイトルは必須、内容は必須、画像は任意)
const postSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  content: z.string().min(1, "内容は必須です"),
  // 画像は任意
})

type PostFormValues = z.infer<typeof postSchema>

export default function NewPostPage() {
  const router = useRouter()
  // ファイル入力を管理 (react-hook-formの外で管理)
  const [file, setFile] = useState<File | null>(null)

  // フォーム初期化
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  })

  // 画像が選択されたらstateに保存
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    } else {
      setFile(null)
    }
  }

  // フォーム送信時
  const onSubmit = async (values: PostFormValues) => {
    toast.loading(" 投稿中...");

    try {
      // 1) ログイン中のユーザーIDを取得
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        toast.dismiss();
        toast.error("ログインしてください " );
        return
      }

      // 2) 画像があれば Supabase Storage にアップロード
      let imagePath = null
      if (file) {
        // ユニークなファイル名 (例: userId + 現在時刻 + 拡張子)
        const fileExt = file.name.split(".").pop()
        const fileName = `${user.id}_${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("images") // imagesバケットにアップロード
          .upload(`posts/${fileName}`, file, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          toast.dismiss();
          toast.error(`画像アップロードに失敗しました: ${uploadError.message}`)
          return
        }

        // アップロード成功 → publicURLを生成
        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(`posts/${fileName}`)
        imagePath = publicUrl
      }

      // 3) PostsテーブルにINSERT
      const { error: insertError } = await supabase.from("Posts").insert({
        user_id: user.id,
        title: values.title,
        content: values.content,
        image_path: imagePath,
      })

      if (insertError) {
        toast.dismiss();
        toast.error(`投稿に失敗しました: ${insertError.message}`)
        return
      }

      // 4) 成功したらメッセージを表示 & トップページに遷移 (or /posts/:id)
      toast.dismiss();
      toast.success("記事を投稿しました。");

      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err: any) {
      console.error(err)
      toast.dismiss();
      toast.error(`エラーが発生しました: ${err.message}`);
    }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto mt-8 p-4">

      <h1 className="text-2xl font-bold mb-6">新規投稿</h1>

      {/* フォーム */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* ファイル入力 (ドラッグ&ドロップ風にするならCSSで工夫) */}
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
                  <Textarea
                    placeholder="記事の内容を入力"
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 送信ボタン */}
          <Button type="submit" className="w-full bg-blue-600 text-white">
            送信
          </Button>
        </form>
      </Form>
    </div>
  )
}
