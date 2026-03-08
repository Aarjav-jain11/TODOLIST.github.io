import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, AlertTriangle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Todo, DIFFICULTY_CONFIG, CATEGORY_CONFIG } from '../types';

interface Props {
  todos: Todo[];
  isOverdue: (todo: Todo) => boolean;
}

export default function CalendarView({ todos, isOverdue }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const todosByDate = useMemo(() => {
    const map: Record<string, Todo[]> = {};
    todos.forEach(t => {
      if (t.dueDate) {
        const key = t.dueDate;
        if (!map[key]) map[key] = [];
        map[key].push(t);
      }
    });
    return map;
  }, [todos]);

  const selectedTodos = selectedDate
    ? todosByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  return (
    <div className="space-y-4 pb-28">
      {/* Month Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/60 border border-gray-700/40 rounded-2xl p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-xl bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h3 className="text-white font-bold text-lg">{format(currentMonth, 'MMMM yyyy')}</h3>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-xl bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-gray-500 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            const key = format(d, 'yyyy-MM-dd');
            const dayTodos = todosByDate[key] || [];
            const hasOverdue = dayTodos.some(t => isOverdue(t));
            const allDone = dayTodos.length > 0 && dayTodos.every(t => t.completed);
            const isSelected = selectedDate && isSameDay(d, selectedDate);
            const isCurrentMonth = isSameMonth(d, monthStart);
            const isCurrentDay = isSameDay(d, new Date());

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(isSelected ? null : d)}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                    : isCurrentDay
                      ? 'bg-indigo-500/20 text-indigo-400 font-bold'
                      : isCurrentMonth
                        ? 'text-gray-300 hover:bg-gray-700/50'
                        : 'text-gray-600'
                }`}
              >
                {format(d, 'd')}
                {dayTodos.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {hasOverdue && <div className="w-1 h-1 rounded-full bg-red-400" />}
                    {allDone ? (
                      <div className="w-1 h-1 rounded-full bg-emerald-400" />
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-indigo-400" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/60 border border-gray-700/40 rounded-2xl p-4"
        >
          <h3 className="text-white font-semibold mb-3">
            {format(selectedDate, 'EEEE, MMMM d')}
          </h3>
          {selectedTodos.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No tasks scheduled</p>
          ) : (
            <div className="space-y-2">
              {selectedTodos.map(todo => {
                const over = isOverdue(todo);
                return (
                  <div
                    key={todo.id}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      todo.completed
                        ? 'bg-gray-700/30'
                        : over
                          ? 'bg-red-500/10 border border-red-500/20'
                          : 'bg-gray-700/50'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      todo.completed ? 'bg-emerald-500 border-emerald-500' : over ? 'border-red-400' : 'border-gray-500'
                    }`}>
                      {todo.completed && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        todo.completed ? 'text-gray-500 line-through' : 'text-white'
                      }`}>
                        {todo.text}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] ${DIFFICULTY_CONFIG[todo.difficulty].color}`}>
                          {DIFFICULTY_CONFIG[todo.difficulty].emoji} {DIFFICULTY_CONFIG[todo.difficulty].label}
                        </span>
                        <span className={`text-[10px] ${CATEGORY_CONFIG[todo.category].color}`}>
                          {CATEGORY_CONFIG[todo.category].emoji} {CATEGORY_CONFIG[todo.category].label}
                        </span>
                        {todo.dueTime && (
                          <span className="text-[10px] text-gray-500">
                            {(() => {
                              const [h, m] = todo.dueTime.split(':').map(Number);
                              const ampm = h >= 12 ? 'PM' : 'AM';
                              return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
                            })()}
                          </span>
                        )}
                      </div>
                    </div>
                    {over && <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Upcoming summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/60 border border-gray-700/40 rounded-2xl p-4"
      >
        <h3 className="text-white font-semibold mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Has tasks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>All completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span>Has overdue</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
