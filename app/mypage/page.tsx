"use client";

import { useEffect, useState } from "react";
import PostList from "@/components/PostList";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

type PostType = {
  id: number;
  title: string;
  content: string;
  image_path: string | null;
  created_at: string;
  user?: {
    email: string;
  };
};

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      const toastId = toast.loading("データを読み込み中...");

      try {
        // ユーザー情報を取得
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError) {
          throw new Error(userError.message);
        }

        if (!userData.user) {
          setUser(null);
          toast.dismiss(toastId);
          return;
        }

        setUser(userData.user);

        // ユーザーの投稿を取得
        const { data: postsData, error: postsError } = await supabase
          .from("Posts")
          .select("*, user:Users(email)")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false });

        if (postsError) {
          throw new Error(postsError.message);
        }

        setPosts(postsData || []);
        toast.dismiss(toastId);
        toast.success("データを読み込みました", { id: toastId });
      } catch (err: unknown) {
        if (err instanceof Error) {
          toast.dismiss(toastId);
          toast.error(`エラー: ${err.message}`, { id: toastId });
        }
      }
    };

    fetchUserAndPosts();
  }, []);

  // ログインしていない場合
  if (!user) {
    return (
      <div className="p-4 text-red-500 max-w-6xl mx-auto mt-8 border border-red-200 bg-red-50 rounded-md">
        <p className="font-medium">
          ログインしていません。マイページを表示できません。
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">マイページ</h1>
      {/* ユーザー情報 (メールアドレス) */}
      <p className="mb-4 text-sm text-gray-500">{user.email} さんの投稿一覧</p>

      {/* 投稿一覧 (PostList) */}
      {posts.length > 0 ? (
        <PostList posts={posts} />
      ) : (
        <div className="p-8 text-center border rounded-md bg-gray-50">
          <p className="text-gray-500">まだ投稿がありません</p>
        </div>
      )}
    </div>
  );
}
