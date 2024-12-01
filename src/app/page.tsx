'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { PostCard } from '@/components/PostCard'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import type { Post } from '@/types/post'
import { SearchAndFilter } from '@/components/SearchAndFilter'
import { useDebounce } from '@/hooks/useDebounce'
import { PostSkeleton } from '@/components/PostSkeleton'

const MAX_CHARS = 500
const POSTS_PER_PAGE = 10

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [newPost, setNewPost] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authorName, setAuthorName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const debouncedSearch = useDebounce(searchTerm, 300)

  useEffect(() => {
    setPage(1)
    setHasMore(true)
    fetchPosts(1, debouncedSearch, sortBy)
  }, [debouncedSearch, sortBy])

  useEffect(() => {
    fetchPosts()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPosts(current => [payload.new as Post, ...current])
          } else if (payload.eventType === 'UPDATE') {
            setPosts(current => 
              current.map(post => 
                post.id === payload.new.id ? { ...post, ...payload.new } : post
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchPosts = async (pageNumber = 1, search = '', sort = 'newest') => {
    try {
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: sort === 'oldest' })
        .range((pageNumber - 1) * POSTS_PER_PAGE, pageNumber * POSTS_PER_PAGE - 1)

      if (search) {
        query = query.ilike('content', `%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      if (pageNumber === 1) {
        setPosts(data)
      } else {
        setPosts(current => [...current, ...data])
      }

      setHasMore(count !== null && count > pageNumber * POSTS_PER_PAGE)
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    await fetchPosts(nextPage)
  }

  useInfiniteScroll(loadMore, hasMore, isLoadingMore)

  const handlePostChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= MAX_CHARS) {
      setNewPost(value)
    }
  }, [])

  const handleSubmit = async () => {
    if (!newPost.trim()) {
      toast.error('Please write something first!')
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            content: newPost.trim(),
            author_name: authorName || 'Anonymous'
          }
        ])
        .select()

      if (error) throw error

      setPosts(current => [data[0], ...current])
      toast.success('Posted successfully!')
      setAuthorName('')
      setNewPost('')
    } catch (error) {
      console.error('Error posting:', error)
      toast.error('Failed to post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white"
        >
          Freedom Wall
        </motion.h1>

        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8"
        >
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name (optional)"
            maxLength={50}
            className="w-full p-4 mb-4 rounded-lg border border-gray-200 dark:border-gray-700 
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     bg-transparent dark:text-white"
          />
          <textarea
            value={newPost}
            onChange={handlePostChange}
            placeholder="Share your thoughts..."
            disabled={isSubmitting}
            maxLength={MAX_CHARS}
            className="w-full h-32 p-4 rounded-lg border border-gray-200 dark:border-gray-700 
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     bg-transparent dark:text-white resize-none
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between items-center mt-4">
            <span className={`text-sm ${newPost.length >= MAX_CHARS ? 'text-red-500' : 'text-gray-500'}`}>
              {newPost.length}/{MAX_CHARS} characters
            </span>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || newPost.length === 0 || newPost.length > MAX_CHARS}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                       transform transition-all duration-200 hover:scale-105
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </motion.div>

        <div className="mt-12">
          {isLoading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-500">No posts yet. Be the first to post!</p>
          ) : (
            <>
              <motion.div layout>
                <AnimatePresence mode="popLayout">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PostCard
                        key={post.id}
                        post={post}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              
              {isLoadingMore && (
                <PostSkeleton />
              )}
              
              {!hasMore && posts.length > 0 && (
                <p className="text-center text-gray-500 mt-8">No more posts to load</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
