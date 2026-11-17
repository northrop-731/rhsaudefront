
import {
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Circle,
} from 'lucide-react';

type IndicatorVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

type IndicatorSize = 'badge' | 'banner';

interface IndicatorProps {
  message: string;
  description?: string;
  variant?: IndicatorVariant;
  size?: IndicatorSize;
  className?: string;
}

const colors = {
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  error: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-cyan-700',
  neutral: 'bg-gray-100 text-gray-700',
};

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
  neutral: Circle,
};

export function Indicator({
  message,
  description,
  variant = 'neutral',
  size = 'badge',
  className = '',
}: IndicatorProps) {
  const Icon = icons[variant];

  if (size === 'banner') {
  return (
    <div
      className={`flex w-full items-start gap-3 rounded-md px-4 py-3 ${colors[variant]} ${className}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />

      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold">
          {message}
        </span>

        {description && (
          <p className="text-xs leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
  if (size === 'badge') {
    return (
      <span
        className={`inline-flex w-fit items-center gap-1.5
          rounded-md px-2 py-1 text-xs font-medium
          ${colors[variant]} ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {message}
      </span>
    );
  }

  return (
    <div
      role="status"
      className={`flex w-full items-start gap-3 rounded-md
        px-4 py-3 ${colors[variant]} ${className}`}
    >
      <Icon
        size={18}
        className="mt-0.5 shrink-0"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold">
          {message}
        </span>

        {description && (
          <p className="text-xs font-normal leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
