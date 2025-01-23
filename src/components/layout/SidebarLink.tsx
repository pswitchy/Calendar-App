'use client';

import { FC, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  children: ReactNode;
  label: string;
  isCollapsed?: boolean;
  onClick?: () => void;
  badge?: number;
  isExternal?: boolean;
}

export const SidebarLink: FC<SidebarLinkProps> = ({
  href,
  icon: Icon,
  label,
  isCollapsed = false,
  onClick,
  badge,
  isExternal = false,
}) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(`${href}/`);
  const currentDateTime = new Date('2025-01-21T15:25:25Z');

  const LinkContent = (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2',
        'transition-all duration-200',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        isActive && 'bg-gray-100 dark:bg-gray-800',
        isCollapsed ? 'justify-center' : 'w-full'
      )}
    >
      <div className="relative">
        <Icon
          className={cn(
            'h-5 w-5',
            isActive
              ? 'text-primary dark:text-primary'
              : 'text-gray-600 dark:text-gray-400'
          )}
        />
        {badge && badge > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white"
          >
            {badge > 99 ? '99+' : badge}
          </motion.div>
        )}
      </div>
      {!isCollapsed && (
        <span
          className={cn(
            'text-sm font-medium',
            isActive
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-400'
          )}
        >
          {label}
        </span>
      )}
    </div>
  );

  const linkProps = {
    href,
    onClick,
    className: cn(
      'transition-colors',
      isCollapsed ? 'w-10' : 'w-full',
      'rounded-lg',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'focus-visible:ring-primary dark:focus-visible:ring-offset-gray-900'
    ),
    ...(isExternal && { target: '_blank', rel: 'noopener noreferrer' }),
  };

  return isCollapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link {...linkProps}>{LinkContent}</Link>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={20}>
        {label}
      </TooltipContent>
    </Tooltip>
  ) : (
    <Link {...linkProps}>{LinkContent}</Link>
  );
}

// Example usage in a navigation group
export function NavigationGroup({
  label,
  children,
  isCollapsed,
}: {
  label: string;
  children: React.ReactNode;
  isCollapsed?: boolean;
}) {
  return (
    <div className="space-y-1">
      {!isCollapsed && (
        <h3 className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </h3>
      )}
      {children}
    </div>
  );
}

// Helper component for a divider
export function SidebarDivider() {
  return <div className="my-4 border-t border-gray-200 dark:border-gray-700" />;
}

// Helper component for expandable sections
export function ExpandableSection({
  label,
  icon: Icon,
  children,
  isCollapsed,
  defaultExpanded = false,
}: {
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
  isCollapsed?: boolean;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="w-full p-2 flex items-center justify-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Icon className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={20}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div>
      <button
        className="w-full p-2 flex items-center justify-between text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <ChevronRight
          className={cn(
            'h-4 w-4 transition-transform',
            isExpanded && 'transform rotate-90'
          )}
        />
      </button>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="pl-4"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

function useState(defaultExpanded: boolean): [any, any] {
    throw new Error('Function not implemented.');
}
