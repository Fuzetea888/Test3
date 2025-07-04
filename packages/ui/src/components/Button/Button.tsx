import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// =============================================================================
// BUTTON VARIANTS
// =============================================================================

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
        destructive: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700',
        outline: 'border border-neutral-300 bg-transparent hover:bg-neutral-50 active:bg-neutral-100 text-neutral-900',
        secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300',
        ghost: 'hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200',
        link: 'text-primary-500 underline-offset-4 hover:underline active:text-primary-600',
        success: 'bg-success-500 text-white hover:bg-success-600 active:bg-success-700',
        warning: 'bg-warning-500 text-white hover:bg-warning-600 active:bg-warning-700',
        info: 'bg-info-500 text-white hover:bg-info-600 active:bg-info-700',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-md px-10',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// =============================================================================
// BUTTON INTERFACE
// =============================================================================

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
}

// =============================================================================
// LOADING SPINNER COMPONENT
// =============================================================================

const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg
    className={cn('animate-spin h-4 w-4', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// =============================================================================
// BUTTON COMPONENT
// =============================================================================

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    
    const isDisabled = disabled || loading;
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <LoadingSpinner className={cn('mr-2', !loadingText && !children && 'mr-0')} />
        )}
        
        {!loading && leftIcon && (
          <span className="mr-2 flex-shrink-0">{leftIcon}</span>
        )}
        
        {loading && loadingText ? loadingText : children}
        
        {!loading && rightIcon && (
          <span className="ml-2 flex-shrink-0">{rightIcon}</span>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

// =============================================================================
// BUTTON GROUP COMPONENT
// =============================================================================

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  attached?: boolean;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = 'horizontal', spacing = 'sm', attached = false, ...props }, ref) => {
    const isHorizontal = orientation === 'horizontal';
    
    return (
      <div
        ref={ref}
        role="group"
        className={cn(
          'inline-flex',
          {
            'flex-col': !isHorizontal,
            'flex-row': isHorizontal,
            // Spacing
            'gap-1': spacing === 'sm',
            'gap-2': spacing === 'md',
            'gap-4': spacing === 'lg',
            // Attached buttons
            '': attached && '[&>*:not(:first-child)]:ml-0 [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0',
          },
          className
        )}
        {...props}
      />
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';

// =============================================================================
// ICON BUTTON COMPONENT
// =============================================================================

interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode;
  'aria-label': string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'icon', ...props }, ref) => (
    <Button
      ref={ref}
      size={size}
      className={cn('flex-shrink-0', className)}
      {...props}
    >
      {icon}
    </Button>
  )
);

IconButton.displayName = 'IconButton';

// =============================================================================
// EXPORTS
// =============================================================================

export { Button, ButtonGroup, IconButton, buttonVariants };
export type { ButtonProps, ButtonGroupProps, IconButtonProps };