/**
 * Advanced Button Component - Top 0.1% Design System
 * Ultra-sophisticated button with animations, haptics, and accessibility
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Zap, ArrowRight, Check } from 'lucide-react';

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0",
        destructive: "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 hover:shadow-lg transform hover:-translate-y-0.5",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-primary/50 transform hover:-translate-y-0.5",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 transform hover:-translate-y-0.5",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-md transform hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105",
        glassmorphism: "backdrop-blur-md bg-white/10 border border-white/20 text-white shadow-xl hover:bg-white/20 transform hover:-translate-y-0.5",
        neon: "bg-black text-cyan-400 border border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transform hover:-translate-y-0.5",
        premium: "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105",
        success: "bg-green-500 text-white shadow-md hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-0.5",
        floating: "bg-primary text-primary-foreground shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-110 rounded-full",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-12 text-base",
        icon: "h-10 w-10",
        floating: "h-16 w-16 rounded-full",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        spin: "animate-spin",
        ping: "animate-ping",
        wobble: "hover:animate-pulse",
        glow: "animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  ripple?: boolean;
  haptic?: boolean;
  sound?: boolean;
  particles?: boolean;
  glow?: boolean;
  magneticEffect?: boolean;
  successState?: boolean;
  href?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      asChild = false,
      loading = false,
      loadingText,
      icon,
      iconPosition = 'left',
      ripple = false,
      haptic = false,
      sound = false,
      particles = false,
      glow = false,
      magneticEffect = false,
      successState = false,
      children,
      disabled,
      onClick,
      href,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);
    const [isPressed, setIsPressed] = React.useState(false);
    const [showParticles, setShowParticles] = React.useState(false);
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const Comp = asChild ? Slot : href ? 'a' : 'button';

    // Ripple effect
    const createRipple = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple) return;
      
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const newRipple = {
        id: Date.now(),
        x,
        y,
      };
      
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }, [ripple]);

    // Haptic feedback
    const triggerHaptic = React.useCallback(() => {
      if (!haptic || !navigator.vibrate) return;
      navigator.vibrate(10);
    }, [haptic]);

    // Sound feedback
    const playSound = React.useCallback(() => {
      if (!sound) return;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }, [sound]);

    // Particle effect
    const triggerParticles = React.useCallback(() => {
      if (!particles) return;
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1000);
    }, [particles]);

    // Magnetic effect
    const handleMouseMove = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (!magneticEffect || !buttonRef.current) return;
      
      const rect = buttonRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      
      setMousePosition({ x: x * 0.1, y: y * 0.1 });
    }, [magneticEffect]);

    const handleMouseLeave = React.useCallback(() => {
      if (!magneticEffect) return;
      setMousePosition({ x: 0, y: 0 });
    }, [magneticEffect]);

    // Handle click with all effects
    const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      
      createRipple(event);
      triggerHaptic();
      playSound();
      triggerParticles();
      setIsPressed(true);
      
      setTimeout(() => setIsPressed(false), 150);
      
      onClick?.(event);
    }, [disabled, loading, createRipple, triggerHaptic, playSound, triggerParticles, onClick]);

    return (
      <motion.div
        style={{
          transform: magneticEffect ? `translate(${mousePosition.x}px, ${mousePosition.y}px)` : undefined,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <Comp
          className={cn(
            buttonVariants({ variant, size, animation, className }),
            glow && "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
            isPressed && "scale-95",
            loading && "cursor-not-allowed"
          )}
          ref={buttonRef}
          disabled={disabled || loading}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          {...(href && { href })}
          {...props}
        >
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          {/* Ripple effects */}
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute bg-white/30 rounded-full pointer-events-none"
              initial={{
                width: 0,
                height: 0,
                x: ripple.x,
                y: ripple.y,
                opacity: 1,
              }}
              animate={{
                width: 200,
                height: 200,
                x: ripple.x - 100,
                y: ripple.y - 100,
                opacity: 0,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}

          {/* Particle effects */}
          <AnimatePresence>
            {showParticles && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-current rounded-full"
                    initial={{
                      x: "50%",
                      y: "50%",
                      opacity: 1,
                    }}
                    animate={{
                      x: `${50 + (Math.random() - 0.5) * 200}%`,
                      y: `${50 + (Math.random() - 0.5) * 200}%`,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.1,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Content */}
          <div className="relative flex items-center gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {loadingText && <span>{loadingText}</span>}
              </>
            ) : successState ? (
              <>
                <Check className="h-4 w-4" />
                <span>Success!</span>
              </>
            ) : (
              <>
                {icon && iconPosition === 'left' && (
                  <span className="transition-transform group-hover:scale-110">
                    {icon}
                  </span>
                )}
                <span className="relative">
                  {children}
                  {variant === 'premium' && (
                    <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 animate-pulse" />
                  )}
                </span>
                {icon && iconPosition === 'right' && (
                  <span className="transition-transform group-hover:scale-110 group-hover:translate-x-1">
                    {icon}
                  </span>
                )}
                {variant === 'gradient' && (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                )}
                {variant === 'neon' && (
                  <Zap className="h-4 w-4 animate-pulse" />
                )}
              </>
            )}
          </div>
        </Comp>
      </motion.div>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };