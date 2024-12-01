import { useEffect, useCallback } from 'react'

export function useInfiniteScroll(
  onLoadMore: () => Promise<void>,
  hasMore: boolean,
  isLoading: boolean
) {
  const handleScroll = useCallback(() => {
    if (isLoading || !hasMore) return

    const scrollHeight = document.documentElement.scrollHeight
    const scrollTop = document.documentElement.scrollTop
    const clientHeight = document.documentElement.clientHeight

    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      onLoadMore()
    }
  }, [isLoading, hasMore, onLoadMore])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])
} 