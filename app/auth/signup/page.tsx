"use client";

import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Mail, Lock, UserPlus, ArrowRight } from "lucide-react";

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

// バリデーション用のZodスキーマ
const signUpSchema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

// スキーマから型を生成
type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  // react-hook-formの初期化
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // フォーム送信時の処理
  const onSubmit = async (values: SignUpFormValues) => {
    // toast.loading でローディング状態を表示し、返ってくるIDで管理する
    toast.loading("ユーザー登録中...");
    const { email, password } = values;

    try {
      // 1) Supabase Authでユーザー作成
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // 2) カスタムUsersテーブルへの登録
      if (data.user) {
        const { error: insertError } = await supabase.from("Users").insert({
          id: data.user.id, // AuthユーザーID (UUID)
          email: data.user.email, // メールアドレス
        });

        if (insertError) {
          throw insertError;
        }
      }

      toast.dismiss();
      toast.success("仮登録が完了しました");
    } catch (error: any) {
      toast.dismiss();
      toast.error("エラーが発生しました: " + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <div className="border rounded-lg shadow-sm p-6 bg-white">
        {/* ヘッダー部分 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl font-bold">アカウント作成</h1>
          <p className="text-gray-500 text-sm mt-1">
            登録して機能をお試しください
          </p>
        </div>

        {/* 以前のメッセージ表示エリアは削除 */}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* メールアドレス */}
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

            {/* パスワード */}
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
                        placeholder="8文字以上のパスワード"
                        className="pl-10 border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs mt-1" />
                </FormItem>
              )}
            />

            {/* 新規登録ボタン */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
            >
              アカウント作成
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>

        {/* 既にアカウントを持っていますか？Login */}
        <div className="mt-6 text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
          既にアカウントを持っていますか？{" "}
          <Link
            href="/auth/login"
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            ログイン
          </Link>
        </div>
      </div>
    </div>
  );
}
