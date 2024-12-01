'use client'

import { motion } from 'framer-motion'
import { Post } from '@/types/post'
import { formatDistanceToNow } from 'date-fns'

type PostCardProps = {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white">
            {post.author_name}
          </h3>
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{post.content}</p>
    </motion.div>
  )
} 