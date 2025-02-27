"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import PostList from "./PostList";

type PostType = {
  id: number
  title: string
  content: string
  image_path: string | null
  created_at: string
  user?: {
    email: string
  }
}

type RealTimePostListProps = {
  page: number;
  searchQuery?: string;
};

export default function RealTimePostList({ page, searchQuery = "" }: RealTimePostListProps) {
  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    const limit = 9;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 初回データ取得
    const fetchPosts = async () => {
      let query = supabase
        .from("Posts")
        .select("*, user:Users(email)")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        setPosts(data);
      }
    };

    fetchPosts();

    // リアルタイム購読の設定（INSERT/DELETEのみ例として）
    const channel = supabase
      .channel("public:Posts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Posts",
        },
        async (payload) => {
          // 新規投稿時、条件に合うかチェックした上でstate更新
          // ※シンプルな例として、常に先頭に追加する例です
          const { data: newPost, error } = await supabase
            .from("Posts")
            .select("*, user:Users(email)")
            .eq("id", payload.new.id)
            .single();
          if (!error && newPost) {
            setPosts((prevPosts) => [newPost, ...prevPosts]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "Posts",
        },
        (payload) => {
          setPosts((prevPosts) =>
            prevPosts.filter((post) => post.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [page, searchQuery]); // URLパラメータが変わるたびに再実行

  return <PostList posts={posts} />;
}
