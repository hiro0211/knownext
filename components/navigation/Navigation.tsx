"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
// Supabaseのユーザー型
import { User } from "@supabase/supabase-js"
// 既存のSupabaseクライアントを読み込む (パスはご自身の環境に合わせてください)
import { supabase } from "@/lib/supabaseClient"

export default function Navigation() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  // マウント時に現在ログイン中のユーザーを取得
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error && data.user) {
        setUser(data.user)
      }
    })
  }, [])

  // ログアウト処理
  const handleLogout = async () => {
    if (!window.confirm("ログアウトしますが、宜しいですか？")) {
      return
    }
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <header className="border-b">
      <div className="mx-auto max-w-screen-lg px-2 py-5 flex items-center justify-between">
        {/* 左側：ロゴやトップリンク */}
        <Link href="/" className="font-bold text-xl">
          KnowNext
        </Link>

        {/* 右側：ユーザーのログイン状態に応じたメニュー */}
        <div className="flex items-center space-x-5 text-sm font-bold">
          {user ? (
            <>
              {/* ログイン中: 「投稿」「設定」などユーザー専用リンクを表示 */}
              <Link href="/posts/new">投稿</Link>
              <Link href="/mypage">マイページ</Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-5 w-5" />
                <span>ログアウト</span>
              </button>
            </>
          ) : (
            <>
              {/* 未ログイン: 「ログイン」「新規登録」リンクを表示 */}
              <Link href="/auth/login">ログイン</Link>
              <Link href="/auth/signup">新規登録</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
