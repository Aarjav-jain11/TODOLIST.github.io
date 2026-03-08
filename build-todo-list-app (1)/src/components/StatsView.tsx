import { motion } from 'framer-motion';
import { CheckCircle2, Circle, AlertTriangle, Star, TrendingUp, Award } from 'lucide-react';
import { DIFFICULTY_CONFIG, CATEGORY_CONFIG, Category, Difficulty } from '../types';

interface Stats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  dueSoon: number;
  starred: number;
  byDifficulty: Record<string, { total: number; done: number }>;
  byCategory: Record<string, { total: number; done: number }>;
}

export default function StatsView({ stats }: { stats: Stats }) {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const getMotivation = () => {
    if (stats.total === 0) return { text: "Ready to start? Add your first task! 🚀", icon: TrendingUp };
    if (completionRate === 100) return { text: "All done! You're a productivity master! 🏆", icon: Award };
    if (completionRate >= 75) return { text: "Almost there! Keep pushing! 💪", icon: TrendingUp };
    if (completionRate >= 50) return { text: "Halfway done! Great progress! ⚡", icon: TrendingUp };
    if (stats.overdue > 0) return { text: `${stats.overdue} overdue task${stats.overdue > 1 ? 's' : ''} need attention! ⚠️`, icon: AlertTriangle };
    return { text: "Let's get things done today! 🎯", icon: TrendingUp };
  };

  const motivation = getMotivation();

  return (
    <div className="space-y-4 pb-28">
      {/* Motivation Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 rounded-2xl p-5"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl">
            <motivation.icon size={22} className="text-indigo-400" />
          </div>
          <p className="text-white font-medium text-sm">{motivation.text}</p>
        </div>
      </motion.div>

      {/* Overall Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-gray-800/60 border border-gray-700/40 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Overall Progress</h3>
          <span className="text-2xl font-bold text-indigo-400">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">{stats.completed} of {stats.total} tasks completed</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        {[
          { label: 'Active', value: stats.active, icon: Circle, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Starred', value: stats.starred, icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border rounded-2xl p-4`}>
            <s.icon size={20} className={`${s.color} mb-2`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* By Difficulty */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-gray-800/60 border border-gray-700/40 rounded-2xl p-5"
      >
        <h3 className="text-white font-semibold mb-4">By Difficulty</h3>
        <div className="space-y-3">
          {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(d => {
            const data = stats.byDifficulty[d];
            const pct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;
            return (
              <div key={d}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${DIFFICULTY_CONFIG[d].color}`}>
                    {DIFFICULTY_CONFIG[d].emoji} {DIFFICULTY_CONFIG[d].label}
                  </span>
                  <span className="text-xs text-gray-400">{data.done}/{data.total} · {pct}%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-2 rounded-full ${
                      d === 'easy' ? 'bg-emerald-500' : d === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* By Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/60 border border-gray-700/40 rounded-2xl p-5"
      >
        <h3 className="text-white font-semibold mb-4">By Category</h3>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(CATEGORY_CONFIG) as Category[]).map(c => {
            const data = stats.byCategory[c];
            if (!data || data.total === 0) return null;
            const pct = Math.round((data.done / data.total) * 100);
            return (
              <div key={c} className={`${CATEGORY_CONFIG[c].bg} rounded-xl p-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{CATEGORY_CONFIG[c].emoji}</span>
                  <span className={`text-xs font-medium ${CATEGORY_CONFIG[c].color}`}>{CATEGORY_CONFIG[c].label}</span>
                </div>
                <p className="text-lg font-bold text-white">{data.done}/{data.total}</p>
                <div className="w-full bg-gray-700/30 rounded-full h-1.5 mt-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    className="h-1.5 rounded-full bg-white/40"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
