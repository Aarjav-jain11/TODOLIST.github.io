export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'personal' | 'work' | 'shopping' | 'health' | 'study' | 'other';
export type FilterType = 'all' | 'active' | 'done' | 'overdue' | 'starred';
export type SortType = 'newest' | 'dueDate' | 'difficulty' | 'alphabetical';
export type TabType = 'tasks' | 'stats' | 'calendar';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  difficulty: Difficulty;
  category: Category;
  dueDate: string | null;
  dueTime: string | null;
  notes: string;
  starred: boolean;
  createdAt: string;
  completedAt: string | null;
  subtasks: Subtask[];
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', emoji: '🟢', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', value: 1 },
  medium: { label: 'Medium', emoji: '🟡', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', value: 2 },
  hard: { label: 'Hard', emoji: '🔴', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', value: 3 },
} as const;

export const CATEGORY_CONFIG = {
  personal: { label: 'Personal', emoji: '👤', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  work: { label: 'Work', emoji: '💼', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  shopping: { label: 'Shopping', emoji: '🛒', color: 'text-pink-400', bg: 'bg-pink-500/20' },
  health: { label: 'Health', emoji: '💪', color: 'text-green-400', bg: 'bg-green-500/20' },
  study: { label: 'Study', emoji: '📚', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  other: { label: 'Other', emoji: '📌', color: 'text-gray-400', bg: 'bg-gray-500/20' },
} as const;
