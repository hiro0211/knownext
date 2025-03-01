"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, User as UserIcon } from "lucide-react"
import { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabaseClient"

export default function Navigation() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

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
    await supabase.auth.signOut()
    setShowLogoutConfirm(false)
    router.push("/auth/login")
  }

  return (
    <header className="border-b relative">
      <div className="w-full max-w-6xl mx-auto px-4 py-8 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl mr-3">
          KnowNext
        </Link>
        <div className="flex items-center space-x-5 text-sm font-bold">
          {user ? (
            <>
              <Link 
                href="/mypage" 
                className="flex items-center space-x-1 transition-colors hover:text-blue-600"
              >
                <UserIcon className="h-5 w-5" />
                <span>マイページ</span>
              </Link>
              <button 
                onClick={() => setShowLogoutConfirm(true)} 
                className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>ログアウト</span>
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/auth/login"
                className="px-4 py-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
              >
                ログイン
              </Link>
              <Link 
                href="/auth/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                新規登録
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ログアウト確認モーダル */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 shadow-lg max-w-sm w-full mx-4">
            <h3 className="font-bold text-lg mb-4">ログアウト確認</h3>
            <p className="text-gray-700 mb-6">ログアウトしますが、宜しいですか？</p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>ログアウト</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}