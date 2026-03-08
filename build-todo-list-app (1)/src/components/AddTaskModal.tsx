import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, FileText, ChevronDown } from 'lucide-react';
import { Difficulty, Category, DIFFICULTY_CONFIG, CATEGORY_CONFIG } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (text: string, difficulty: Difficulty, category: Category, dueDate: string | null, dueTime: string | null, notes: string) => void;
}

export default function AddTaskModal({ open, onClose, onAdd }: Props) {
  const [text, setText] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [category, setCategory] = useState<Category>('personal');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [notes, setNotes] = useState('');
  const [showMore, setShowMore] = useState(false);

  const reset = () => {
    setText(''); setDifficulty('medium'); setCategory('personal');
    setDueDate(''); setDueTime(''); setNotes(''); setShowMore(false);
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAdd(text, difficulty, category, dueDate || null, dueTime || null, notes);
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-gray-900 rounded-t-3xl border-t border-gray-700/50 p-6 pb-8 shadow-2xl">
              {/* Handle bar */}
              <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-5" />

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">New Task</h2>
                <button onClick={onClose} className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Task name */}
              <input
                type="text"
                placeholder="What needs to be done?"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                autoFocus
                className="w-full px-4 py-3.5 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg mb-5"
              />

              {/* Difficulty */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(d => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                        difficulty === d
                          ? `${DIFFICULTY_CONFIG[d].bg} ${DIFFICULTY_CONFIG[d].color} border-2 ${DIFFICULTY_CONFIG[d].border} shadow-lg`
                          : 'bg-gray-800 text-gray-400 border-2 border-transparent hover:bg-gray-750'
                      }`}
                    >
                      {DIFFICULTY_CONFIG[d].emoji} {DIFFICULTY_CONFIG[d].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(CATEGORY_CONFIG) as Category[]).map(c => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                        category === c
                          ? `${CATEGORY_CONFIG[c].bg} ${CATEGORY_CONFIG[c].color} border-2 border-current shadow-lg`
                          : 'bg-gray-800 text-gray-400 border-2 border-transparent hover:bg-gray-750'
                      }`}
                    >
                      {CATEGORY_CONFIG[c].emoji} {CATEGORY_CONFIG[c].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date & Time */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                    <Calendar size={14} /> Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                    <Clock size={14} /> Time
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={e => setDueTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* More options toggle */}
              <button
                onClick={() => setShowMore(!showMore)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 mb-4 transition-colors"
              >
                <ChevronDown size={16} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />
                {showMore ? 'Less options' : 'More options'}
              </button>

              <AnimatePresence>
                {showMore && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                      <FileText size={14} /> Notes
                    </label>
                    <textarea
                      placeholder="Add any extra details..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-semibold rounded-2xl text-lg transition-all shadow-lg shadow-indigo-500/25 disabled:shadow-none"
              >
                Create Task
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
