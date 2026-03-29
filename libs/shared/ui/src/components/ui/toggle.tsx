import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cn } from '../../lib/utils';

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
      {
        'data-[variant=default]': 'bg-background',
        'data-[variant=outline]':
          'border border-input bg-transparent shadow-sm',
        'data-[variant=secondary]': 'bg-secondary text-secondary-foreground',
      }[variant || 'default'],
      {
        'data-[size=default]': 'h-9 px-3',
        'data-[size=sm]': 'h-8 px-2',
        'data-[size=lg]': 'h-10 px-3',
      }[size || 'default'],
    )}
    {...props}
  />
));
Toggle.displayName = TogglePrimitive.Root.displayName;

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Group>
>(({ className, ...props }, ref) => (
  <TogglePrimitive.Group
    ref={ref}
    className={cn('flex items-center justify-center rounded-md', className)}
    {...props}
  />
));
ToggleGroup.displayName = TogglePrimitive.Group.displayName;

export { Toggle, ToggleGroup };
