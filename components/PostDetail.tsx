"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";
import Loading from "@/app/loading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarClock, Mail, ArrowLeft, Trash, Edit, AlertCircle } from "lucide-react";

type PostDetailProps = {
  post: {
    id: number;
    title: string;
    content: string;
    image_path: string | null;
    created_at: string;
    user?: {
      id: string;
      email: string;
    };
  };
};

export default function PostDetail({ post }: PostDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // 現在ログイン中のユーザーIDを取得
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setSessionUserId(data.user?.id ?? null);
    };
    fetchUser();
  }, []);

  // 投稿者本人かどうかを判定
  const isAuthor = sessionUserId === post.user?.id;

  // 日付のフォーマット
  const formattedDate = dayjs(post.created_at).format("YYYY/MM/DD HH:mm");

  // 記事削除
  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("Posts").delete().eq("id", post.id);

      if (error) {
        throw error;
      }

      setMessage("記事を削除しました。");
      // 2秒後にトップページへリダイレクト
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error: any) {
      setMessage("記事の削除に失敗しました: " + error.message);
    } finally {
      setLoading(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* ローディングアニメーション */}
      {loading && <Loading />}

      {/* 戻るリンク */}
      <Link 
        href="/" 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        <span>記事一覧に戻る</span>
      </Link>

      {/* メッセージ表示 */}
      {message && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-md text-sm text-red-800 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
          <p>{message}</p>
        </div>
      )}

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        {/* 画像表示 */}
        {post.image_path ? (
          <div className="relative w-full h-64 md:h-80">
            <img
              src={post.image_path}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-64 md:h-80 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}

        <div className="p-6">
          {/* タイトル・投稿者情報 */}
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap items-center space-x-4 mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center text-gray-500 space-x-1">
              <Mail className="h-4 w-4" />
              <span>{post.user?.email || "Unknown User"}</span>
            </div>
            
            <div className="flex items-center text-gray-500 space-x-1">
              <CalendarClock className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* 本文 */}
          <div className="prose max-w-none mb-8">
            <p className="whitespace-pre-line text-gray-700 leading-relaxed">{post.content}</p>
          </div>

          {/* 投稿者アクションボタン */}
          {isAuthor && (
            <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-100">
              {!showConfirmDelete ? (
                <>
                  <Button
                    onClick={() => setShowConfirmDelete(true)}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    記事を削除
                  </Button>
                  <Link href={`/posts/${post.id}/edit`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center">
                      <Edit className="h-4 w-4 mr-2" />
                      記事を編集
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="w-full p-4 bg-red-50 border border-red-100 rounded-md">
                  <p className="text-sm text-red-800 mb-3">この記事を削除してもよろしいですか？この操作は取り消せません。</p>
                  <div className="flex space-x-3 justify-end">
                    <Button 
                      variant="outline"
                      onClick={() => setShowConfirmDelete(false)}
                      className="text-gray-700"
                    >
                      キャンセル
                    </Button>
                    <Button
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      削除する
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}