export type Post = {
  id: string
  content: string
  author_name: string
  created_at: string
}

export type PaginatedPosts = {
  data: Post[]
  nextPage: number | null
} 