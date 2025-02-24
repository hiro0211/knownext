"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabaseClient"

export default function Navigation() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  // onAuthStateChangeで認証状態の変更を監視する
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    // マウント時にも現在の状態を取得
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error && data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    })

    // クリーンアップ
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    if (!window.confirm("ログアウトしますが、宜しいですか？")) {
      return
    }
    await supabase.auth.signOut()
    // ここでsetUser(null) はonAuthStateChangeのイベントで自動更新されるので不要
    router.push("/auth/login")
  }

  return (
    <header className="border-b">
      <div className="mx-auto max-w-screen-lg px-2 py-5 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          KnowNext
        </Link>
        <div className="flex items-center space-x-5 text-sm font-bold">
          {user ? (
            <>
              <Link href="/posts/new">投稿</Link>
              <Link href="/mypage">マイページ</Link>
              <button onClick={handleLogout} className="flex items-center space-x-1">
                <LogOut className="h-5 w-5" />
                <span>ログアウト</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">ログイン</Link>
              <Link href="/auth/signup">新規登録</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
