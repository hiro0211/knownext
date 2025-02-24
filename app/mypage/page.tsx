import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import PostList from "@/components/PostList"

export default async function MyPage() {
  // Supabaseクライアント (サーバーコンポーネント用)
  const supabase = createServerComponentClient({ cookies })

  const { data: { session } } = await supabase.auth.getSession()
  console.log("セッションは" + session)
  // 1) ログイン中のユーザーを取得
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  console.log("ユーザーは" + user)
  if (!user) {
    // ログインしていない場合
    return (
      <div className="p-4 text-red-500">
        ログインしていません。マイページを表示できません。
      </div>
    )
  }

  // 2) このユーザーが投稿した記事一覧を取得
  //    JOINしてUsersテーブルのemailを user.email として取得
  const { data: posts, error: postsError } = await supabase
    .from("Posts")
    .select("*, user:Users(email)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (postsError) {
    return (
      <div className="p-4 text-red-500">エラー: {postsError.message}</div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">マイページ</h1>

      {/* ユーザー情報 (メールアドレス) */}
      <p className="mb-4 text-sm text-gray-500">
        {user.email} さんの投稿一覧
      </p>

      {/* 投稿一覧 (PostList) */}
      <PostList posts={posts || []} />
    </div>
  )
}
