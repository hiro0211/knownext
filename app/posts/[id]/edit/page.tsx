import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import EditPostForm from "@/components/EditPostForm";

type PageProps = {
  params: { id: string };
};

export default async function EditPostPage({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies });
  
  // 指定されたidの記事を取得
  const { data: post, error } = await supabase
    .from("Posts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !post) {
    return (
      <div className="p-4 text-red-500">
        記事が見つかりません: {error?.message}
      </div>
    );
  }

  // postの情報をEditPostFormへ渡す
  return (
    <div className="max-w-2xl mx-auto p-4">
      <EditPostForm post={post} />
    </div>
  );
}
