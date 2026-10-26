import { Star } from 'lucide-react';

/** Five stars with a half-step fill, plus an optional review count. */
export default function Rating({ value = 0, count, size = 14, className = '' }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.max(0, Math.min(1, value - (i - 1)));
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 text-line-strong" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={size} className="text-amber-400" fill="currentColor" />
              </span>
            </span>
          );
        })}
      </div>
      <span className="sr-only">{value.toFixed(1)} out of 5 stars</span>
      {count !== undefined && (
        <span className="text-xs text-muted">
          {value.toFixed(1)} <span className="text-muted">({count.toLocaleString('en-US')})</span>
        </span>
      )}
    </div>
  );
}
