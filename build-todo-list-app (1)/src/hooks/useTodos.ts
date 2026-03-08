import { useState, useEffect, useCallback } from 'react';
import { Todo, Subtask, Difficulty, Category, FilterType, SortType, DIFFICULTY_CONFIG } from '../types';
import { isAfter, isBefore, parseISO, addHours } from 'date-fns';

const STORAGE_KEY = 'taskmaster-pro-todos';

const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

const loadTodos = (): Todo[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveTodos = (todos: Todo[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
};

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');

  useEffect(() => { saveTodos(todos); }, [todos]);

  const addTodo = useCallback((
    text: string,
    difficulty: Difficulty,
    category: Category,
    dueDate: string | null,
    dueTime: string | null,
    notes: string
  ) => {
    if (!text.trim()) return;
    const newTodo: Todo = {
      id: generateId(),
      text: text.trim(),
      completed: false,
      difficulty,
      category,
      dueDate,
      dueTime,
      notes,
      starred: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      subtasks: [],
    };
    setTodos(prev => [newTodo, ...prev]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null } : t
    ));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const toggleStar = useCallback((id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
  }, []);

  const addSubtask = useCallback((todoId: string, text: string) => {
    if (!text.trim()) return;
    const subtask: Subtask = { id: generateId(), text: text.trim(), completed: false };
    setTodos(prev => prev.map(t =>
      t.id === todoId ? { ...t, subtasks: [...t.subtasks, subtask] } : t
    ));
  }, []);

  const toggleSubtask = useCallback((todoId: string, subtaskId: string) => {
    setTodos(prev => prev.map(t =>
      t.id === todoId ? {
        ...t,
        subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
      } : t
    ));
  }, []);

  const deleteSubtask = useCallback((todoId: string, subtaskId: string) => {
    setTodos(prev => prev.map(t =>
      t.id === todoId ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) } : t
    ));
  }, []);

  const completeAll = useCallback(() => {
    setTodos(prev => prev.map(t => ({ ...t, completed: true, completedAt: new Date().toISOString() })));
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(t => !t.completed));
  }, []);

  const isOverdue = useCallback((todo: Todo) => {
    if (todo.completed || !todo.dueDate) return false;
    const dueStr = todo.dueTime ? `${todo.dueDate}T${todo.dueTime}` : `${todo.dueDate}T23:59:59`;
    return isBefore(parseISO(dueStr), new Date());
  }, []);

  const isDueSoon = useCallback((todo: Todo) => {
    if (todo.completed || !todo.dueDate) return false;
    const dueStr = todo.dueTime ? `${todo.dueDate}T${todo.dueTime}` : `${todo.dueDate}T23:59:59`;
    const dueDate = parseISO(dueStr);
    return isAfter(dueDate, new Date()) && isBefore(dueDate, addHours(new Date(), 24));
  }, []);

  const filteredTodos = todos
    .filter(t => {
      if (search) {
        const q = search.toLowerCase();
        if (!t.text.toLowerCase().includes(q) && !t.notes.toLowerCase().includes(q)) return false;
      }
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      switch (filter) {
        case 'active': return !t.completed;
        case 'done': return t.completed;
        case 'overdue': return isOverdue(t);
        case 'starred': return t.starred;
        default: return true;
      }
    })
    .sort((a, b) => {
      // Starred first
      if (a.starred !== b.starred) return a.starred ? -1 : 1;
      switch (sort) {
        case 'dueDate': {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          const aStr = a.dueTime ? `${a.dueDate}T${a.dueTime}` : `${a.dueDate}T23:59:59`;
          const bStr = b.dueTime ? `${b.dueDate}T${b.dueTime}` : `${b.dueDate}T23:59:59`;
          return parseISO(aStr).getTime() - parseISO(bStr).getTime();
        }
        case 'difficulty':
          return DIFFICULTY_CONFIG[b.difficulty].value - DIFFICULTY_CONFIG[a.difficulty].value;
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
    overdue: todos.filter(t => isOverdue(t)).length,
    dueSoon: todos.filter(t => isDueSoon(t)).length,
    starred: todos.filter(t => t.starred).length,
    byDifficulty: {
      easy: { total: todos.filter(t => t.difficulty === 'easy').length, done: todos.filter(t => t.difficulty === 'easy' && t.completed).length },
      medium: { total: todos.filter(t => t.difficulty === 'medium').length, done: todos.filter(t => t.difficulty === 'medium' && t.completed).length },
      hard: { total: todos.filter(t => t.difficulty === 'hard').length, done: todos.filter(t => t.difficulty === 'hard' && t.completed).length },
    },
    byCategory: Object.fromEntries(
      (['personal', 'work', 'shopping', 'health', 'study', 'other'] as Category[]).map(cat => [
        cat,
        { total: todos.filter(t => t.category === cat).length, done: todos.filter(t => t.category === cat && t.completed).length }
      ])
    ),
  };

  return {
    todos: filteredTodos,
    allTodos: todos,
    stats,
    filter, setFilter,
    sort, setSort,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    addTodo, toggleTodo, deleteTodo, updateTodo, toggleStar,
    addSubtask, toggleSubtask, deleteSubtask,
    completeAll, clearCompleted,
    isOverdue, isDueSoon,
  };
}
