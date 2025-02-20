"use client"

import React from "react"
import { useRouter } from "next/navigation"

type Props = {
  currentPage: number
  totalPages: number
  searchQuery: string
}

/**
 * ページ番号を切り替えると、/?page=2 などに移動
 * searchQuery がある場合、/?page=2&search=xxx となる
 */
export default function Pagination({
  currentPage,
  totalPages,
  searchQuery,
}: Props) {
  const router = useRouter()

  // 前のページへ
  const handlePrev = () => {
    if (currentPage > 1) {
      const searchParam = searchQuery
        ? `&search=${encodeURIComponent(searchQuery)}`
        : ""
      router.push(`/?page=${currentPage - 1}${searchParam}`)
    }
  }

  // 次のページへ
  const handleNext = () => {
    if (currentPage < totalPages) {
      const searchParam = searchQuery
        ? `&search=${encodeURIComponent(searchQuery)}`
        : ""
      router.push(`/?page=${currentPage + 1}${searchParam}`)
    }
  }

  return (
    <div className="flex items-center justify-center mt-8 gap-4">
      <button
        onClick={handlePrev}
        disabled={currentPage <= 1}
        className="underline text-blue-600 disabled:text-gray-400"
      >
        Previous Page
      </button>

      <span className="font-medium">
        Page {currentPage} / {totalPages}
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage >= totalPages}
        className="underline text-blue-600 disabled:text-gray-400"
      >
        Next Page
      </button>
    </div>
  )
}
