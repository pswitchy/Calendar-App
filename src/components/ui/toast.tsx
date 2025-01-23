'use client';

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4',
      'sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950',
        success:
          'border-green-500/30 bg-green-50 dark:border-green-500/30 dark:bg-green-900/30',
        error:
          'border-red-500/30 bg-red-50 dark:border-red-500/30 dark:bg-red-900/30',
        warning:
          'border-yellow-500/30 bg-yellow-50 dark:border-yellow-500/30 dark:bg-yellow-900/30',
        info: 'border-blue-500/30 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-900/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-transparent px-3',
      'text-sm font-medium ring-offset-white transition-colors hover:bg-gray-100',
      'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      'group-[.error]:border-red-500/30 group-[.error]:hover:border-red-500/30',
      'group-[.error]:hover:bg-red-500 group-[.error]:hover:text-white',
      'group-[.success]:border-green-500/30 group-[.success]:hover:border-green-500/30',
      'group-[.success]:hover:bg-green-500 group-[.success]:hover:text-white',
      'dark:border-gray-800 dark:ring-offset-gray-950 dark:hover:bg-gray-800',
      'dark:focus:ring-gray-800 dark:group-[.error]:border-red-500/30',
      'dark:group-[.success]:border-green-500/30',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-gray-500/50 opacity-0 transition-opacity',
      'hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100',
      'dark:text-gray-400/50 dark:hover:text-gray-50',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};

// Custom Toast Hook
export function useCustomToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = React.useCallback(
    (props: ToastProps) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prevToasts) => [...prevToasts, { ...props, id }]);

      // Auto remove toast after duration
      setTimeout(() => {
        setToasts((prevToasts) =>
          prevToasts.filter((toast) => toast.id !== id)
        );
      }, 5000); // 5 seconds
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Helper functions for different toast types
  const success = React.useCallback(
    (message: string) => {
      addToast({
        variant: 'success',
        children: (
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <div className="flex-1">{message}</div>
          </div>
        ),
      });
    },
    [addToast]
  );

  const error = React.useCallback(
    (message: string) => {
      addToast({
        variant: 'error',
        children: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <div className="flex-1">{message}</div>
          </div>
        ),
      });
    },
    [addToast]
  );

  const warning = React.useCallback(
    (message: string) => {
      addToast({
        variant: 'warning',
        children: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <div className="flex-1">{message}</div>
          </div>
        ),
      });
    },
    [addToast]
  );

  const info = React.useCallback(
    (message: string) => {
      addToast({
        variant: 'info',
        children: (
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <div className="flex-1">{message}</div>
          </div>
        ),
      });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}

// Toaster Component
export function Toaster() {
  const { toasts } = useCustomToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, ...props }) => (
        <Toast key={id} {...props} />
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}