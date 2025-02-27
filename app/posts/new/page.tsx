"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import Loading from "@/app/loading";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PenSquare, Upload, FileImage, X, AlertCircle } from "lucide-react";

// バリデーションルール
const postSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  content: z.string().min(1, "内容は必須です"),
});

type PostFormValues = z.infer<typeof postSchema>;

export default function NewPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // フォーム初期化
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  // ファイル入力欄クリック
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  // 画像が選択された時
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setFormError(null);

    if (selectedFile) {
      // ファイルサイズチェック (2MB)
      if (selectedFile.size > 2 * 1024 * 1024) {
        setFormError("ファイルサイズは2MB以下にしてください");
        setFile(null);
        e.target.value = "";
        return;
      }

      // プレビュー表示
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  // 画像削除
  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // フォーム送信時
  const onSubmit = async (values: PostFormValues) => {
    setSubmitting(true);
    setFormError(null);
    toast.loading("投稿中...");

    try {
      // 1) ログイン中のユーザーIDを取得
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.dismiss();
        toast.error("ログインしてください");
        setFormError(
          "ログインが必要です。ログインページからログインしてください。"
        );
        setSubmitting(false);
        return;
      }

      // 2) 画像があれば Supabase Storage にアップロード
      let imagePath = null;
      if (file) {
        // ユニークなファイル名を生成
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("images")
          .upload(`posts/${fileName}`, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          toast.dismiss();
          toast.error(`画像アップロードに失敗しました`);
          setFormError(`画像アップロードエラー: ${uploadError.message}`);
          setSubmitting(false);
          return;
        }

        // 公開URL取得
        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(`posts/${fileName}`);
        imagePath = publicUrl;
      }

      // 3) PostsテーブルにINSERT
      const { error: insertError } = await supabase.from("Posts").insert({
        user_id: user.id,
        title: values.title,
        content: values.content,
        image_path: imagePath,
      });

      if (insertError) {
        toast.dismiss();
        toast.error("投稿に失敗しました");
        setFormError(`データベースエラー: ${insertError.message}`);
        setSubmitting(false);
        return;
      }

      // 4) 投稿成功処理
      toast.dismiss();
      toast.success("記事を投稿しました");

      // トップページへ遷移
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      toast.dismiss();
      toast.error("エラーが発生しました");
      setFormError(`予期せぬエラー: ${err.message}`);
      setSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mt-8 p-4">
      {submitting && <Loading />}

      <div className="flex items-center space-x-2 mb-6">
        <PenSquare className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">新規投稿</h1>
      </div>

      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4 mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{formError}</p>
        </div>
      )}

      {/* フォーム */}
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
                <p className="text-sm text-center mt-2 text-gray-500">
                  {file?.name} ({((file?.size ?? 0) / 1024).toFixed(0)}KB)
                </p>
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

          {/* 送信ボタン */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 transition-colors"
            disabled={submitting}
          >
            <PenSquare className="h-5 w-5 mr-2" />
            投稿する
          </Button>
        </form>
      </Form>
    </div>
  );
}
