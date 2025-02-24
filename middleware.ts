// middleware.ts (プロジェクトのルート直下に配置)
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  // セッション情報を初期化（Cookieから読み込む）
  await supabase.auth.getSession()
  return res
}
