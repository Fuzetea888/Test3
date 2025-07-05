interface BadgeProps {
  variant?: 'default' | 'outline';
  className?: string;
  children: any;
}

export const Badge = ({ variant = 'default', className = '', children }: BadgeProps) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    outline: 'border border-gray-300 text-gray-700',
  };

  const allClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return <span className={allClasses}>{children}</span>;
};