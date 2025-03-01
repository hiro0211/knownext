import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { FileText, PenSquare } from "lucide-react";
import Link from "next/link";
import SearchForm from "../components/SearchForm";
import Pagination from "../components/Pagination";
import RealTimePostList from "../components/RealTimePostList";

// Home ページはサーバーコンポーネント
export default async function Home({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const searchQuery = searchParams.search || "";
  const page = parseInt(searchParams.page || "1", 10);
  // 1ページあたりの表示数
  const limit = 9;

  // サーバーコンポーネント用 Supabase クライアントの作成
  const supabase = createServerComponentClient({ cookies });

  // 投稿数のカウントクエリを作成
  let countQuery = supabase
    .from("Posts")
    .select("*", { count: "exact", head: true });
  if (searchQuery) {
    // 検索条件がある場合、タイトルまたは内容に対して部分一致検索を適用
    countQuery = countQuery.or(
      `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`
    );
  }
  const { count, error: countError } = await countQuery;
  if (countError) {
    console.error("投稿数の取得エラー:", countError.message);
  }
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* ヘッダーエリア */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">記事一覧</h1>
          {searchQuery && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              &quot;{searchQuery}&quot;
            </span>
          )}
        </div>
        <Link
          href="/posts/new"
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors self-start sm:self-center"
        >
          <PenSquare className="h-4 w-4 mr-2" />
          新規投稿
        </Link>
      </div>

      {/* 検索フォーム */}
      <div className="mb-6">
        <SearchForm />
      </div>

      {/* 投稿一覧部分: リアルタイム更新対応コンポーネント */}
      <RealTimePostList page={page} searchQuery={searchQuery} />

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            searchQuery={searchQuery}
          />
        </div>
      )}
    </div>
  );
}
