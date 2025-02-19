"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Loading from "../../loading";

// Supabaseクライアント
import { supabase } from "@/lib/supabaseClient";

// shadcn/uiフォーム関連
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import Link from "next/link";

// Zodでバリデーションのルールを定義
const loginSchema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

// バリデーションで使う型
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

  // ローディング状態 & メッセージ状態
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");

  // react-hook-form の初期化
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // フォーム送信時の処理
  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true); // ローディング開始
    setMessage(""); // メッセージを一旦クリア

    const { email, password } = values;

    // Supabase Authを使ったログイン
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // エラーがあればメッセージ表示
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    // ログイン成功
    setMessage("ログインに成功しました。");
    setLoading(false);

    // 2秒後にトップページなど任意の場所へ遷移
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-sm mx-auto mt-12">
      {/* ローディング中は画面中央にアニメーションを重ねて表示 */}
      {loading && <Loading />}

      <h1 className="text-2xl font-bold mb-4">ログイン</h1>

      {/* メッセージ表示 */}
      {message && (
        <div className="text-center text-sm text-red-500 my-5">{message}</div>
      )}

      {/* フォーム本体 */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          {/* Email */}
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

          {/* Password */}
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

          {/* ログインボタン */}
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-800"
          >
            ログイン
          </Button>
        </form>
      </Form>

      {/* まだアカウントが無い場合のリンク */}
      <div className="mt-4 text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="underline hover:text-primary">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
