import { z } from 'zod';

// =============================================================================
// DESIGN SYSTEM TYPES
// =============================================================================

export interface DesignTokens {
  colors: {
    primary: ColorScale;
    success: ColorScale;
    warning: ColorScale;
    danger: ColorScale;
    neutral: ColorScale;
  };
  typography: {
    fontFamily: {
      sans: string[];
      mono: string[];
    };
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
    lineHeight: Record<string, number>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  breakpoints: Record<string, string>;
  zIndex: Record<string, number>;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

// =============================================================================
// COMPONENT VARIANTS
// =============================================================================

export const ButtonVariant = z.enum([
  'primary',
  'secondary',
  'outline',
  'ghost',
  'danger',
  'success',
  'warning',
]);

export const ButtonSize = z.enum(['xs', 'sm', 'md', 'lg', 'xl']);

export const InputVariant = z.enum(['default', 'error', 'success', 'warning']);

export const InputSize = z.enum(['sm', 'md', 'lg']);

export const CardVariant = z.enum(['default', 'bordered', 'shadow', 'elevated']);

export const ModalSize = z.enum(['xs', 'sm', 'md', 'lg', 'xl', 'full']);

export const AlertVariant = z.enum(['info', 'success', 'warning', 'error']);

export const BadgeVariant = z.enum([
  'default',
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
]);

export const BadgeSize = z.enum(['sm', 'md', 'lg']);

export const LoadingSpinnerSize = z.enum(['xs', 'sm', 'md', 'lg', 'xl']);

export const ProgressSize = z.enum(['sm', 'md', 'lg']);

export const AvatarSize = z.enum(['xs', 'sm', 'md', 'lg', 'xl', '2xl']);

export const TooltipPlacement = z.enum([
  'top',
  'bottom',
  'left',
  'right',
  'top-start',
  'top-end',
  'bottom-start',
  'bottom-end',
  'left-start',
  'left-end',
  'right-start',
  'right-end',
]);

export const DropdownPlacement = z.enum([
  'bottom',
  'bottom-start',
  'bottom-end',
  'top',
  'top-start',
  'top-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end',
]);

// =============================================================================
// COMPONENT TYPES
// =============================================================================

export type ButtonVariantType = z.infer<typeof ButtonVariant>;
export type ButtonSizeType = z.infer<typeof ButtonSize>;
export type InputVariantType = z.infer<typeof InputVariant>;
export type InputSizeType = z.infer<typeof InputSize>;
export type CardVariantType = z.infer<typeof CardVariant>;
export type ModalSizeType = z.infer<typeof ModalSize>;
export type AlertVariantType = z.infer<typeof AlertVariant>;
export type BadgeVariantType = z.infer<typeof BadgeVariant>;
export type BadgeSizeType = z.infer<typeof BadgeSize>;
export type LoadingSpinnerSizeType = z.infer<typeof LoadingSpinnerSize>;
export type ProgressSizeType = z.infer<typeof ProgressSize>;
export type AvatarSizeType = z.infer<typeof AvatarSize>;
export type TooltipPlacementType = z.infer<typeof TooltipPlacement>;
export type DropdownPlacementType = z.infer<typeof DropdownPlacement>;

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface ButtonProps {
  variant?: ButtonVariantType;
  size?: ButtonSizeType;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children: React.ReactNode;
}

export interface InputProps {
  variant?: InputVariantType;
  size?: InputSizeType;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
}

export interface TextareaProps {
  variant?: InputVariantType;
  size?: InputSizeType;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  rows?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  className?: string;
}

export interface SelectProps {
  variant?: InputVariantType;
  size?: InputSizeType;
  placeholder?: string;
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  options: SelectOption[];
  className?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  label?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export interface RadioProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  label?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  value?: string;
  name?: string;
  className?: string;
  children?: React.ReactNode;
}

export interface CardProps {
  variant?: CardVariantType;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  hoverable?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: ModalSizeType;
  title?: string;
  description?: string;
  closable?: boolean;
  backdrop?: boolean;
  backdropClosable?: boolean;
  escapeClosable?: boolean;
  centered?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  title?: string;
  closable?: boolean;
  backdrop?: boolean;
  backdropClosable?: boolean;
  escapeClosable?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface AlertProps {
  variant?: AlertVariantType;
  title?: string;
  description?: string;
  closable?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export interface BadgeProps {
  variant?: BadgeVariantType;
  size?: BadgeSizeType;
  dot?: boolean;
  count?: number;
  max?: number;
  showZero?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface LoadingSpinnerProps {
  size?: LoadingSpinnerSizeType;
  color?: string;
  className?: string;
}

export interface ProgressProps {
  value: number;
  max?: number;
  size?: ProgressSizeType;
  color?: string;
  showValue?: boolean;
  striped?: boolean;
  animated?: boolean;
  className?: string;
}

export interface AvatarProps {
  size?: AvatarSizeType;
  src?: string;
  alt?: string;
  fallback?: string;
  online?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface TooltipProps {
  content: React.ReactNode;
  placement?: TooltipPlacementType;
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  placement?: DropdownPlacementType;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface TabPanelProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export interface AccordionProps {
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  collapsible?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface AccordionItemProps {
  value: string;
  trigger: React.ReactNode;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

// =============================================================================
// TABLE TYPES
// =============================================================================

export interface TableProps {
  data: any[];
  columns: TableColumn[];
  loading?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  pagination?: TablePagination;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  onSelect?: (selectedRows: any[]) => void;
  onRowClick?: (row: any) => void;
  className?: string;
}

export interface TableColumn {
  key: string;
  title: string;
  dataIndex?: string;
  width?: number;
  fixed?: 'left' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: any, index: number) => React.ReactNode;
  className?: string;
}

export interface TablePagination {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  onChange?: (page: number, pageSize: number) => void;
}

// =============================================================================
// FORM TYPES
// =============================================================================

export interface FormProps {
  initialValues?: Record<string, any>;
  validationSchema?: any;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  onReset?: () => void;
  className?: string;
  children: React.ReactNode;
}

export interface FormFieldProps {
  name: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface FormErrorProps {
  name: string;
  className?: string;
}

// =============================================================================
// NAVIGATION TYPES
// =============================================================================

export interface NavigationItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: number;
  disabled?: boolean;
  children?: NavigationItem[];
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export interface BreadcrumbItem {
  key: string;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export interface PaginationProps {
  current: number;
  total: number;
  pageSize?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  onChange?: (page: number, pageSize: number) => void;
  className?: string;
}

// =============================================================================
// FEEDBACK TYPES
// =============================================================================

export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  description?: string;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

export interface ToastStore {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: any) => void;
  children: React.ReactNode;
}

// =============================================================================
// LAYOUT TYPES
// =============================================================================

export interface LayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  width?: number;
  className?: string;
  children: React.ReactNode;
}

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: BreadcrumbItem[];
  className?: string;
}

export interface FooterProps {
  links?: { label: string; href: string }[];
  copyright?: string;
  className?: string;
}

// =============================================================================
// DASHBOARD TYPES
// =============================================================================

export interface DashboardWidgetProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  value?: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    period?: string;
  };
  loading?: boolean;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  data: any;
  options?: any;
  width?: number;
  height?: number;
  loading?: boolean;
  className?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  icon?: React.ReactNode;
  color?: string;
  loading?: boolean;
  className?: string;
}

// =============================================================================
// ANIMATION TYPES
// =============================================================================

export interface AnimationProps {
  type?: 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce';
  duration?: number;
  delay?: number;
  easing?: string;
  loop?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface TransitionProps {
  show: boolean;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
  className?: string;
  children: React.ReactNode;
}

// =============================================================================
// THEME TYPES
// =============================================================================

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  fontFamily: 'inter' | 'system' | 'mono';
  density: 'compact' | 'comfortable' | 'spacious';
}

export interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  toggleMode: () => void;
}

// =============================================================================
// RESPONSIVE TYPES
// =============================================================================

export interface ResponsiveProps {
  xs?: any;
  sm?: any;
  md?: any;
  lg?: any;
  xl?: any;
  '2xl'?: any;
}

export interface BreakpointContextType {
  breakpoint: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
}

// =============================================================================
// ACCESSIBILITY TYPES
// =============================================================================

export interface A11yProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  role?: string;
  tabIndex?: number;
}

export interface FocusManagementProps {
  autoFocus?: boolean;
  trapFocus?: boolean;
  restoreFocus?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  finalFocus?: React.RefObject<HTMLElement>;
}

// =============================================================================
// COMPONENT STATE TYPES
// =============================================================================

export interface ComponentState {
  loading?: boolean;
  error?: string | null;
  success?: boolean;
  disabled?: boolean;
  focused?: boolean;
  hovered?: boolean;
  pressed?: boolean;
  selected?: boolean;
  expanded?: boolean;
  checked?: boolean;
}

export interface InteractiveProps {
  onFocus?: () => void;
  onBlur?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onKeyUp?: (event: React.KeyboardEvent) => void;
}

// =============================================================================
// UTILITIES
// =============================================================================

export type WithClassName<T = {}> = T & {
  className?: string;
};

export type WithChildren<T = {}> = T & {
  children: React.ReactNode;
};

export type WithOptionalChildren<T = {}> = T & {
  children?: React.ReactNode;
};

export type Polymorphic<T extends React.ElementType> = {
  as?: T;
} & React.ComponentPropsWithoutRef<T>;

export type ForwardRefComponent<T, P = {}> = React.ForwardRefExoticComponent<
  P & React.RefAttributes<T>
>;

export type ComponentVariants<T> = T extends Record<string, any>
  ? {
      [K in keyof T]: T[K] extends Record<string, any>
        ? keyof T[K]
        : T[K] extends string
        ? T[K]
        : never;
    }
  : never;