// Custom Toast Hook
'use client';

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { X, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import {ToastProps , ToastViewport, Toast} from '@/components/ui/toast';
const ToastProvider = ToastPrimitives.Provider;

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