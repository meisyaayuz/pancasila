interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical';
  size?: 'sm' | 'md';
}

export function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const config = {
    low: {
      label: 'Rendah',
      className: 'bg-green-50 text-green-700 border-green-200',
    },
    medium: {
      label: 'Sedang',
      className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    },
    high: {
      label: 'Tinggi',
      className: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    critical: {
      label: 'Kritis',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${config[level]?.className || config.low.className}
        ${sizeClass}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        level === 'critical' ? 'bg-red-500' :
        level === 'high' ? 'bg-orange-500' : 
        level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
      }`} />
      {config[level]?.label || 'Rendah'}
    </span>
  );
}
