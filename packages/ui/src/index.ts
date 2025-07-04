/**
 * ComplianceOS UI Design System
 * Enterprise-grade React components and design tokens
 */

// =============================================================================
// DESIGN TOKENS
// =============================================================================

export * from './tokens/design-tokens';

// =============================================================================
// COMPONENTS
// =============================================================================

// Base Components
export * from './components/Button/Button';

// =============================================================================
// UTILITIES
// =============================================================================

export * from './utils/cn';

// =============================================================================
// TYPES
// =============================================================================

export type { 
  DesignTokens,
  Colors,
  Typography,
  Spacing,
  Shadows,
  BorderRadius,
  Breakpoints,
  ZIndex,
  Animation,
  Variants,
  Semantic,
} from './tokens/design-tokens';

// =============================================================================
// PACKAGE INFO
// =============================================================================

export const UI_PACKAGE_INFO = {
  name: '@complianceos/ui',
  version: '1.0.0',
  description: 'Enterprise design system and UI components for ComplianceOS',
  components: [
    'Button',
    'ButtonGroup',
    'IconButton',
    // More components to be added...
  ],
  features: [
    'Accessible by default',
    'Fully customizable',
    'TypeScript support',
    'Responsive design',
    'Dark mode support',
    'Modern design tokens',
    'Radix UI primitives',
    'Tailwind CSS styling',
    'Storybook documentation',
    'Framer Motion animations',
  ],
  designPrinciples: [
    'Accessibility first',
    'Mobile responsive',
    'Performance optimized',
    'Enterprise ready',
    'Consistent branding',
    'Scalable architecture',
  ],
} as const;

// =============================================================================
// VERSION INFO
// =============================================================================

export const version = '1.0.0';
export const buildDate = new Date().toISOString();

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default {
  ...UI_PACKAGE_INFO,
  version,
  buildDate,
};