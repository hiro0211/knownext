import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import PostList from "@/components/PostList"

export default async function Home() {
  // サーバーコンポーネントでSupabaseクライアントを生成
  const supabase = createServerComponentClient({ cookies })

  // Postsテーブルからデータ取得
  // 例: ユーザー名や投稿日時も表示したいなら、JOINやselectを工夫します
  const { data: posts, error } = await supabase
    .from("Posts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching posts:", error.message)
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">記事一覧</h1>

      {/* 検索フォーム（ダミー） */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-full max-w-sm border border-gray-300 rounded-md p-2"
        />
      </div>

      {/* PostListにデータを渡して表示 */}
      <PostList posts={posts || []} />

      {/* ページネーション（ダミー） */}
      <div className="flex items-center justify-center mt-8 gap-4">
        <button className="text-blue-600 underline">Previous Page</button>
        <div>1 2 3 ...</div>
        <button className="text-blue-600 underline">Next Page</button>
      </div>
    </div>
  )
}
