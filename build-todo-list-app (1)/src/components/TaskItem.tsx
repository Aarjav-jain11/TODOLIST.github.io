import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trash2, ChevronDown, Plus, X, Check, AlertTriangle, Clock, Calendar, FileText } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { Todo, Difficulty, Category, DIFFICULTY_CONFIG, CATEGORY_CONFIG } from '../types';

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onToggleStar: (id: string) => void;
  onAddSubtask: (todoId: string, text: string) => void;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
  onDeleteSubtask: (todoId: string, subtaskId: string) => void;
  isOverdue: boolean;
  isDueSoon: boolean;
}

function formatDueDate(date: string, time: string | null): string {
  const d = parseISO(date);
  let dateStr = '';
  if (isToday(d)) dateStr = 'Today';
  else if (isTomorrow(d)) dateStr = 'Tomorrow';
  else if (isYesterday(d)) dateStr = 'Yesterday';
  else dateStr = format(d, 'MMM d, yyyy');
  if (time) {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    dateStr += ` at ${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  }
  return dateStr;
}

export default function TaskItem({
  todo, onToggle, onDelete, onUpdate, onToggleStar,
  onAddSubtask, onToggleSubtask, onDeleteSubtask,
  isOverdue, isDueSoon
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const diff = DIFFICULTY_CONFIG[todo.difficulty];
  const cat = CATEGORY_CONFIG[todo.category];
  const subtaskProgress = todo.subtasks.length > 0
    ? Math.round((todo.subtasks.filter(s => s.completed).length / todo.subtasks.length) * 100)
    : 0;

  const handleEditSubmit = () => {
    if (editText.trim()) {
      onUpdate(todo.id, { text: editText.trim() });
    }
    setEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -300 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`rounded-2xl border transition-all overflow-hidden ${
        todo.completed
          ? 'bg-gray-800/40 border-gray-700/30'
          : isOverdue
            ? 'bg-red-950/30 border-red-500/30 shadow-lg shadow-red-500/5'
            : isDueSoon
              ? 'bg-amber-950/20 border-amber-500/30 shadow-lg shadow-amber-500/5'
              : todo.starred
                ? 'bg-indigo-950/20 border-indigo-500/30 shadow-lg shadow-indigo-500/5'
                : 'bg-gray-800/60 border-gray-700/40 hover:border-gray-600/60'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => onToggle(todo.id)}
            className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              todo.completed
                ? 'bg-emerald-500 border-emerald-500'
                : isOverdue
                  ? 'border-red-400/60 hover:border-red-400'
                  : 'border-gray-500 hover:border-indigo-400'
            }`}
          >
            {todo.completed && <Check size={14} className="text-white" strokeWidth={3} />}
          </motion.button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onBlur={handleEditSubmit}
                onKeyDown={e => e.key === 'Enter' && handleEditSubmit()}
                autoFocus
                className="w-full bg-gray-700 text-white px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            ) : (
              <p
                onClick={() => { setEditing(true); setEditText(todo.text); }}
                className={`text-sm font-medium cursor-pointer ${
                  todo.completed ? 'text-gray-500 line-through' : 'text-white'
                }`}
              >
                {todo.text}
              </p>
            )}

            {/* Tags Row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${diff.bg} ${diff.color}`}>
                {diff.emoji} {diff.label}
              </span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${cat.bg} ${cat.color}`}>
                {cat.emoji} {cat.label}
              </span>
              {todo.dueDate && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  isOverdue
                    ? 'bg-red-500/20 text-red-400'
                    : isDueSoon
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-gray-700 text-gray-400'
                }`}>
                  {isOverdue ? <AlertTriangle size={10} /> : <Clock size={10} />}
                  {formatDueDate(todo.dueDate, todo.dueTime)}
                </span>
              )}
              {todo.subtasks.length > 0 && (
                <span className="text-[10px] text-gray-500 font-medium">
                  {todo.subtasks.filter(s => s.completed).length}/{todo.subtasks.length} subtasks
                </span>
              )}
            </div>

            {/* Subtask progress */}
            {todo.subtasks.length > 0 && (
              <div className="mt-2 w-full bg-gray-700/50 rounded-full h-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${subtaskProgress}%` }}
                  className="bg-indigo-500 h-1 rounded-full"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => onToggleStar(todo.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                todo.starred ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              <Star size={16} fill={todo.starred ? 'currentColor' : 'none'} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-gray-600 hover:text-gray-400 transition-colors"
            >
              <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => onDelete(todo.id)}
              className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 transition-colors"
            >
              <Trash2 size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-700/30 pt-3 space-y-3">
              {/* Edit fields */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1 block">Difficulty</label>
                  <select
                    value={todo.difficulty}
                    onChange={e => onUpdate(todo.id, { difficulty: e.target.value as Difficulty })}
                    className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(d => (
                      <option key={d} value={d}>{DIFFICULTY_CONFIG[d].emoji} {DIFFICULTY_CONFIG[d].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1 block">Category</label>
                  <select
                    value={todo.category}
                    onChange={e => onUpdate(todo.id, { category: e.target.value as Category })}
                    className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {(Object.keys(CATEGORY_CONFIG) as Category[]).map(c => (
                      <option key={c} value={c}>{CATEGORY_CONFIG[c].emoji} {CATEGORY_CONFIG[c].label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Calendar size={10} /> Due Date
                  </label>
                  <input
                    type="date"
                    value={todo.dueDate || ''}
                    onChange={e => onUpdate(todo.id, { dueDate: e.target.value || null })}
                    className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Clock size={10} /> Time
                  </label>
                  <input
                    type="time"
                    value={todo.dueTime || ''}
                    onChange={e => onUpdate(todo.id, { dueTime: e.target.value || null })}
                    className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <FileText size={10} /> Notes
                </label>
                <textarea
                  value={todo.notes}
                  onChange={e => onUpdate(todo.id, { notes: e.target.value })}
                  placeholder="Add notes..."
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Subtasks */}
              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-2 block">Subtasks</label>
                <div className="space-y-1.5">
                  {todo.subtasks.map(sub => (
                    <div key={sub.id} className="flex items-center gap-2 group">
                      <button
                        onClick={() => onToggleSubtask(todo.id, sub.id)}
                        className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          sub.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500'
                        }`}
                      >
                        {sub.completed && <Check size={10} className="text-white" strokeWidth={3} />}
                      </button>
                      <span className={`text-xs flex-1 ${sub.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                        {sub.text}
                      </span>
                      <button
                        onClick={() => onDeleteSubtask(todo.id, sub.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-500 hover:text-red-400 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add subtask..."
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newSubtask.trim()) {
                        onAddSubtask(todo.id, newSubtask);
                        setNewSubtask('');
                      }
                    }}
                    className="flex-1 px-2 py-1.5 bg-gray-700/30 border border-gray-600/30 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => {
                      if (newSubtask.trim()) {
                        onAddSubtask(todo.id, newSubtask);
                        setNewSubtask('');
                      }
                    }}
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Meta */}
              <div className="text-[10px] text-gray-600 pt-1">
                Created {format(parseISO(todo.createdAt), 'MMM d, yyyy h:mm a')}
                {todo.completedAt && ` · Completed ${format(parseISO(todo.completedAt), 'MMM d, yyyy h:mm a')}`}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
