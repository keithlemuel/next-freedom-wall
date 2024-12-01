import { motion } from 'framer-motion'

type SortOption = 'newest' | 'oldest'

type Props = {
  searchTerm: string
  onSearchChange: (value: string) => void
  sortBy: SortOption
  onSortChange: (value: SortOption) => void
}

export function SearchAndFilter({ searchTerm, onSearchChange, sortBy, onSortChange }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-8 flex flex-col sm:flex-row gap-4"
    >
      <div className="flex-1">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search posts..."
          className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 
                   focus:ring-2 focus:ring-purple-500 focus:border-transparent
                   bg-transparent dark:text-white"
        />
      </div>
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="appearance-none p-3 pl-6 pr-12 rounded-lg border border-gray-200 dark:border-gray-700 
                   focus:ring-2 focus:ring-purple-500 focus:border-transparent
                   bg-transparent dark:text-white cursor-pointer
                   min-w-[140px]"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        <svg 
          className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400 dark:text-gray-500"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </motion.div>
  )
}