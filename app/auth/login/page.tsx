"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";

import { supabase } from "@/lib/supabaseClient";

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

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    // トーストでフィードバックを表示
    toast.loading("ログイン中...");

    // ログイン処理
    const { email, password } = values;

    try {
      // 
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.dismiss();
      toast.success("ログインに成功しました");
      router.push("/");
    } catch (error: unknown) {
      toast.dismiss();
      if (error instanceof Error) {
        toast.error("ログインに失敗しました: " + error.message);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <div className="border rounded-lg shadow-sm p-6 bg-white">
        {/* ヘッダー部分 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
            <LogIn size={24} />
          </div>
          <h1 className="text-2xl font-bold">ログイン</h1>
          <p className="text-gray-500 text-sm mt-1">
            アカウントにログインしてください
          </p>
        </div>

        {/* フォーム本体 */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">メールアドレス</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="email"
                        placeholder="example@mail.com"
                        className="pl-10 border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs mt-1" />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">パスワード</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="password"
                        placeholder="パスワードを入力"
                        className="pl-10 border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs mt-1" />
                </FormItem>
              )}
            />

            {/* パスワードを忘れた場合 まだ実装はしていない。リンクのみ表示 */}
            <div className="text-right">
              <Link
                href="/auth/reset-password"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                パスワードをお忘れですか？
              </Link>
            </div>

            {/* ログインボタン */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
            >
              ログイン
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>

        {/* まだアカウントが無い場合のリンク */}
        <div className="mt-6 text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
          アカウントを持っていませんか？{" "}
          <Link
            href="/auth/signup"
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            新規登録
          </Link>
        </div>
      </div>
    </div>
  );
}
