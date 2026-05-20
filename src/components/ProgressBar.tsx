'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  known: number;
  unknown: number;
}

export default function ProgressBar({ current, total, known, unknown }: ProgressBarProps) {
  const reviewed = known + unknown;
  const percent = total === 0 ? 0 : Math.round((reviewed / total) * 100);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-between text-sm text-gray-500">
        <span>
          Card <span className="font-semibold text-gray-700">{current}</span> of{' '}
          <span className="font-semibold text-gray-700">{total}</span>
        </span>
        <span className="flex gap-3">
          <span className="text-emerald-600 font-medium">✓ {known} known</span>
          <span className="text-rose-500 font-medium">✗ {unknown} unknown</span>
        </span>
      </div>

      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-xs text-gray-400 text-right">{percent}% reviewed</p>
    </div>
  );
}
