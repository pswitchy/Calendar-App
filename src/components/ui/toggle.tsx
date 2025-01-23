'use client';

import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cn } from '@/lib/utils';

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>
>(({ className, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
      'data-[state=on]:bg-primary data-[state=on]:text-white',
      'hover:bg-gray-100 hover:text-gray-900',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle };