"use client"

import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { supabase } from "@/lib/supabaseClient"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// バリデーション用のZodスキーマ
const signUpSchema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください"),
})

// スキーマから型を生成
type SignUpFormValues = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const router = useRouter()

  // react-hook-formの初期化
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // フォーム送信時の処理
  const onSubmit = async (values: SignUpFormValues) => {
    const { email, password } = values

    // 1) Supabase Authでユーザー作成
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.error("Sign up error:", error.message)
      alert(error.message)
      return
    }

    // 2) カスタムUsersテーブルへの登録が必要な場合
    //    (Supabase Authだけで十分なら、以下は不要です)
    if (data.user) {
      const { error: insertError } = await supabase.from("Users").insert({
        id: data.user.id,       // AuthユーザーID (UUID)
        email: data.user.email, // メールアドレス
        // image_pathなど、必要に応じて追加
      })

      if (insertError) {
        console.error("Insert user error:", insertError.message)
        alert("ユーザー情報の保存に失敗しました。")
        return
      }
    }

    // 3) サインアップ成功後、ログイン画面へ遷移
    alert("新規登録が完了しました。ログインしてください。")
    router.push("/login")
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-4">新規登録</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
          {/* メールアドレス */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>メールアドレス</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* パスワード */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>パスワード</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 新規登録ボタン */}
          <Button type="submit" className="w-full">
            新規登録
          </Button>
        </form>
      </Form>

      {/* 既にアカウントを持っていますか？Login */}
      <div className="mt-4 text-sm">
        既にアカウントを持っていますか？{" "}
        <a href="/login" className="underline hover:text-primary">
          Login
        </a>
      </div>
    </div>
  )
}
