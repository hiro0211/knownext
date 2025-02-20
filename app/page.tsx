import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import dayjs from "dayjs"
import SearchForm from "../components/SearchForm"
import Pagination from "../components/Pagination"
import PostList from "../components/PostList"


// searchParamsを引数で受け取ることでクエリパラメータを取得できる
export default async function Home({
  searchParams,
}: {
  searchParams: { search?: string; page?: string }
}) {
  // Supabaseクライアント (サーバーコンポーネント用)
  const supabase = createServerComponentClient({ cookies })

  // 1ページあたり9件表示
  const limit = 9
  const page = parseInt(searchParams.page || "1", 10)
  const searchQuery = searchParams.search || ""

  // 取得範囲 (例: page=2なら10~18番目を取得)
  const from = (page - 1) * limit
  const to = from + limit - 1

  // ベースのクエリ
  let query = supabase
    .from("Posts")
    // JOINしてUsersテーブルのemailを user.email として取得
    .select("*, user:Users(email)")
    .order("created_at", { ascending: false })
    .range(from, to)

  // 検索クエリがあれば、タイトル or 本文に対して部分一致検索
  if (searchQuery) {
    // ilike: 大文字小文字区別なしの部分一致
    // or() を使うと複数条件をORでつなげられます
    query = query.or(
      `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`
    )
  }

  // 投稿の実データを取得
  const { data: posts, error } = await query
  if (error) {
    console.error("Error fetching posts:", error.message)
    return <div className="p-4 text-red-500">エラー: {error.message}</div>
  }

  // ページネーション用に、全投稿数(count)も取得
  // head:true + count:"exact" で件数だけ取得できます
  const { count } = await supabase
    .from("Posts")
    .select("*", { count: "exact", head: true })

  const totalPosts = count || 0
  const totalPages = Math.ceil(totalPosts / limit)

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">記事一覧</h1>

      {/* 検索フォーム (クライアントコンポーネント) */}
      <SearchForm />

      {/* 投稿一覧 (クライアントコンポーネント) */}
      <PostList posts={posts || []} />

      {/* ページネーション (クライアントコンポーネント) */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        searchQuery={searchQuery}
      />
    </div>
  )
}
