"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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

  // ページ番号ボタンを生成
  const renderPageNumbers = () => {
    const pageNumbers = []
    const maxButtonsToShow = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2))
    let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1)
    
    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxButtonsToShow) {
      startPage = Math.max(1, endPage - maxButtonsToShow + 1)
    }
    
    // First page
    if (startPage > 1) {
      pageNumbers.push(
        <Button
          key="1"
          variant="ghost"
          size="sm"
          onClick={() => {
            const searchParam = searchQuery
              ? `&search=${encodeURIComponent(searchQuery)}`
              : ""
            router.push(`/?page=1${searchParam}`)
          }}
          className={`w-10 h-10 p-0 rounded-md font-medium`}
        >
          1
        </Button>
      )
      
      // Ellipsis if needed
      if (startPage > 2) {
        pageNumbers.push(
          <span key="start-ellipsis" className="px-1">
            ...
          </span>
        )
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            if (i !== currentPage) {
              const searchParam = searchQuery
                ? `&search=${encodeURIComponent(searchQuery)}`
                : ""
              router.push(`/?page=${i}${searchParam}`)
            }
          }}
          className={`w-10 h-10 p-0 rounded-md font-medium ${
            i === currentPage 
              ? "bg-blue-600 text-white hover:bg-blue-700" 
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {i}
        </Button>
      )
    }
    
    // Ellipsis if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push(
        <span key="end-ellipsis" className="px-1">
          ...
        </span>
      )
    }
    
    // Last page
    if (endPage < totalPages) {
      pageNumbers.push(
        <Button
          key={totalPages}
          variant="ghost"
          size="sm"
          onClick={() => {
            const searchParam = searchQuery
              ? `&search=${encodeURIComponent(searchQuery)}`
              : ""
            router.push(`/?page=${totalPages}${searchParam}`)
          }}
          className={`w-10 h-10 p-0 rounded-md font-medium`}
        >
          {totalPages}
        </Button>
      )
    }
    
    return pageNumbers
  }

  // 合計件数が0の場合は何も表示しない
  if (totalPages === 0) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center mt-8 space-y-2">
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          className="px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>前へ</span>
        </Button>

        <div className="hidden sm:flex items-center space-x-1 mx-2">
          {renderPageNumbers()}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className="px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
        >
          <span>次へ</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="text-sm text-gray-500 font-medium sm:hidden">
        ページ {currentPage} / {totalPages}
      </div>
    </div>
  )
}