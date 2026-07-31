import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
  {
    variants: {
      variant: {
        default:
          'border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20',
        secondary:
          'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800',
        destructive:
          'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20',
        outline: 'text-slate-300 border-slate-700',
        success:
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  className?: string;
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
