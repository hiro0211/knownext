import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import PostDetail from "@/components/PostDetail"
import CommentSection from "@/components/CommentSection"
import toast from "react-hot-toast"

type PageProps = {
  params: { id: string }
}

export default async function PostDetailPage({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies })

  // Postsテーブルから、idに該当する記事を取得 (UsersテーブルとJOIN)
  const { data: postData, error: postError } = await supabase
    .from("Posts")
    .select("*, user:Users(email, id)") // JOINしたユーザー情報を user という別名で取得
    .eq("id", params.id)
    .single()

  if (postError || !postData) {
    return (
      <div className="p-4 text-red-500">
        記事が見つかりませんでした: {postError?.message}
      </div>
    )
  }

  // Commentsテーブルから、post_idに該当するコメントを取得 (UsersテーブルとJOIN)
  const { data: commentsData, error: commentsError } = await supabase
    .from("Comments")
    .select("*, user:Users(email, id)")
    .eq("post_id", params.id)
    .order("created_at", { ascending: true })

  if (commentsError) {
    // コメント取得に失敗しても、記事詳細だけは表示
    toast.error("コメントの取得に失敗しました: " + commentsError.message) 
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* 記事詳細表示 (クライアントコンポーネント) */}
      <PostDetail post={postData} />
      {/* コメント一覧＆コメント投稿フォーム (クライアントコンポーネント) */}
      <CommentSection
        postId={postData.id}
        initialComments={commentsData || []}
      />
    </div>
  )
}
