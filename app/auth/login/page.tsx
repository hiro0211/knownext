"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

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
    toast.loading("ログイン中...");

    const { email, password } = values;

    // Supabase Authを使ったログイン
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // エラーがあればメッセージ表示
    if (error) {
      toast.dismiss()
      toast.error("ログインに失敗しました: " + error.message)
      return;
    }

    // ログイン成功
    toast.dismiss();
    toast.success("ログインに成功しました");

    // ログイン後のページに遷移
    router.push("/");
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-4">ログイン</h1>

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
                    placeholder="メールアドレスを入力"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
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
                    placeholder="パスワードを入力"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
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
        アカウントを持っていませんか?{" "}
        <Link href="/auth/signup" className="underline hover:text-primary">
          新規登録
        </Link>
      </div>
    </div>
  );
}
