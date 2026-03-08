import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, SlidersHorizontal, ListTodo, BarChart3, CalendarDays,
  CheckCheck, Trash2, ArrowUpDown, Filter, X
} from 'lucide-react';
import { useTodos } from './hooks/useTodos';
import TaskItem from './components/TaskItem';
import AddTaskModal from './components/AddTaskModal';
import StatsView from './components/StatsView';
import CalendarView from './components/CalendarView';
import { FilterType, SortType, Category, CATEGORY_CONFIG, TabType } from './types';

const FILTER_OPTIONS: { value: FilterType; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '📋' },
  { value: 'active', label: 'Active', emoji: '🔵' },
  { value: 'done', label: 'Done', emoji: '✅' },
  { value: 'overdue', label: 'Overdue', emoji: '🔴' },
  { value: 'starred', label: 'Starred', emoji: '⭐' },
];

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'difficulty', label: 'Hardest First' },
  { value: 'alphabetical', label: 'A → Z' },
];

export default function App() {
  const {
    todos, allTodos, stats,
    filter, setFilter, sort, setSort,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    addTodo, toggleTodo, deleteTodo, updateTodo, toggleStar,
    addSubtask, toggleSubtask, deleteSubtask,
    completeAll, clearCompleted,
    isOverdue, isDueSoon,
  } = useTodos();

  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                TaskMaster Pro
              </h1>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {stats.active} active · {stats.completed} done
                {stats.overdue > 0 && <span className="text-red-400"> · {stats.overdue} overdue</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearch(''); }}
                className={`p-2.5 rounded-xl transition-colors ${
                  showSearch ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Search size={18} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl transition-colors ${
                  showFilters ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <SlidersHorizontal size={18} />
              </motion.button>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 relative">
                  <Search size={16} className="absolute left-3 top-1/2 mt-1.5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 mt-1.5 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-3">
                  {/* Status Filter */}
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <Filter size={10} /> Status
                    </label>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {FILTER_OPTIONS.map(f => (
                        <button
                          key={f.value}
                          onClick={() => setFilter(f.value)}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            filter === f.value
                              ? 'bg-indigo-600 text-white shadow-lg'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {f.emoji} {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <Filter size={10} /> Category
                    </label>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      <button
                        onClick={() => setCategoryFilter('all')}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          categoryFilter === 'all'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        All
                      </button>
                      {(Object.keys(CATEGORY_CONFIG) as Category[]).map(c => (
                        <button
                          key={c}
                          onClick={() => setCategoryFilter(c)}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            categoryFilter === c
                              ? `${CATEGORY_CONFIG[c].bg} ${CATEGORY_CONFIG[c].color} shadow-lg`
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {CATEGORY_CONFIG[c].emoji} {CATEGORY_CONFIG[c].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <ArrowUpDown size={10} /> Sort By
                    </label>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {SORT_OPTIONS.map(s => (
                        <button
                          key={s.value}
                          onClick={() => setSort(s.value)}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            sort === s.value
                              ? 'bg-indigo-600 text-white shadow-lg'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={completeAll}
                      disabled={stats.active === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-600/30 transition-colors disabled:opacity-30"
                    >
                      <CheckCheck size={12} /> Complete All
                    </button>
                    <button
                      onClick={clearCompleted}
                      disabled={stats.completed === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-600/30 transition-colors disabled:opacity-30"
                    >
                      <Trash2 size={12} /> Clear Done
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 pt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3 pb-28"
            >
              {/* Due Soon Alert */}
              {stats.dueSoon > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3"
                >
                  <span className="text-lg">⏰</span>
                  <div>
                    <p className="text-amber-400 text-xs font-medium">
                      {stats.dueSoon} task{stats.dueSoon > 1 ? 's' : ''} due within 24 hours
                    </p>
                  </div>
                </motion.div>
              )}

              {todos.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="text-6xl mb-4">
                    {allTodos.length === 0 ? '🚀' : search ? '🔍' : '🎉'}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-400 mb-1">
                    {allTodos.length === 0
                      ? 'Ready to be productive?'
                      : search
                        ? 'No matching tasks'
                        : 'All caught up!'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {allTodos.length === 0
                      ? 'Tap the + button to add your first task'
                      : search
                        ? 'Try a different search term'
                        : 'No tasks match the current filters'}
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {todos.map(todo => (
                    <TaskItem
                      key={todo.id}
                      todo={todo}
                      onToggle={toggleTodo}
                      onDelete={deleteTodo}
                      onUpdate={updateTodo}
                      onToggleStar={toggleStar}
                      onAddSubtask={addSubtask}
                      onToggleSubtask={toggleSubtask}
                      onDeleteSubtask={deleteSubtask}
                      isOverdue={isOverdue(todo)}
                      isDueSoon={isDueSoon(todo)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <StatsView stats={stats} />
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CalendarView todos={allTodos} isOverdue={isOverdue} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FAB - Add button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-4 sm:right-auto sm:left-1/2 sm:translate-x-[200px] w-14 h-14 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full shadow-xl shadow-indigo-500/30 flex items-center justify-center z-40"
      >
        <Plus size={24} className="text-white" />
      </motion.button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800/50 z-40">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
          {[
            { tab: 'tasks' as TabType, icon: ListTodo, label: 'Tasks', badge: stats.active },
            { tab: 'stats' as TabType, icon: BarChart3, label: 'Stats', badge: null },
            { tab: 'calendar' as TabType, icon: CalendarDays, label: 'Calendar', badge: null },
          ].map(({ tab, icon: Icon, label, badge }) => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab(tab)}
              className={`relative flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-colors ${
                activeTab === tab
                  ? 'text-indigo-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className="relative">
                <Icon size={22} />
                {badge != null && badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-2 w-6 h-0.5 bg-indigo-400 rounded-full"
                />
              )}
            </motion.button>
          ))}
        </div>
        {/* Safe area for mobile */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      {/* Add Task Modal */}
      <AddTaskModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addTodo}
      />
    </div>
  );
}
