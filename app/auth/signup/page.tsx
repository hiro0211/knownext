"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

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
  const router = useRouter();

  // ローディングとメッセージ表示用の状態
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");

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
    toast.loading("ユーザー登録中...");

    const { email, password } = values;

    // 1) Supabase Authでユーザー作成
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast.dismiss();
      toast.error("ユーザー登録中にエラーが発生しました: " + error.message);
      return;
    }

    // 2) カスタムUsersテーブルへの登録
    if (data.user) {
      const { error: insertError } = await supabase.from("Users").insert({
        id: data.user.id, // AuthユーザーID (UUID)
        email: data.user.email, // メールアドレス
      });

      if (insertError) {
        toast.dismiss();
        toast.error(
          "ユーザー情報保存中にエラーが発生しました: " + insertError.message
        );
        return;
      }
    }

    toast.dismiss();
    setMessage(
      "仮登録が完了しました。ご入力いただいたメールアドレスに確認用のメールを送信しました。\
      メールに記載されたリンクをクリックしてアカウントを有効化してください。\
      もしメールが届かない場合は、迷惑メールフォルダに入っていないかご確認ください。"
    );
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-4">新規登録</h1>

      {/* エラーメッセージまたは成功メッセージの表示 */}
      {message && (
        <div className="text-center text-sm text-red-500 my-5">{message}</div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
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
                    placeholder="メールアドレスを入力"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
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
                    placeholder="パスワードを入力"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* 新規登録ボタン */}
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-800 "
          >
            新規登録
          </Button>
        </form>
      </Form>

      {/* 既にアカウントを持っていますか？Login */}
      <div className="mt-4 text-sm">
        既にアカウントを持っていますか？{" "}
        <Link href="/auth/login" className="underline hover:text-primary">
          ログイン
        </Link>
      </div>
    </div>
  );
}
