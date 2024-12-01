export type User = {
  id: string
  username: string
  created_at: string
  avatar_url?: string
  bio?: string
}

export type UserProfile = User & {
  total_posts: number
  total_likes_received: number
} 