import * as React from 'react';
import * as InputOTPPrimitive from '@radix-ui/react-input-otp';
import { Check, Clipboard, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const InputOTP = InputOTPPrimitive.Root;

const InputOTPGroup = React.forwardRef<
  React.ElementRef<typeof InputOTPPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof InputOTPPrimitive.Group>
>(({ className, ...props }, ref) => (
  <InputOTPPrimitive.Group
    ref={ref}
    className={cn('flex items-center gap-2', className)}
    {...props}
  />
));
InputOTPGroup.displayName = InputOTPPrimitive.Group.displayName;

const InputOTPSlot = React.forwardRef<
  React.ElementRef<typeof InputOTPPrimitive.Slot>,
  React.ComponentPropsWithoutRef<typeof InputOTPPrimitive.Slot>
>(({ className, isActive, ...props }, ref) => (
  <InputOTPPrimitive.Slot
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 items-center justify-center rounded-md border text-lg font-medium transition-all',
      isActive && 'border-ring ring-2 ring-ring',
      className,
    )}
    {...props}
  />
));
InputOTPSlot.displayName = InputOTPPrimitive.Slot.displayName;

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<typeof InputOTPPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof InputOTPPrimitive.Separator>
>(({ ...props }, ref) => <InputOTPPrimitive.Separator ref={ref} {...props} />);
InputOTPSeparator.displayName = InputOTPPrimitive.Separator.displayName;

const InputOTPInput = React.forwardRef<
  React.ElementRef<typeof InputOTPPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof InputOTPPrimitive.Input>
>(({ className, ...props }, ref) => (
  <InputOTPPrimitive.Input
    ref={ref}
    className={cn(
      'flex h-10 w-10 rounded-md border border-input bg-background px-0 text-center text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
InputOTPInput.displayName = InputOTPPrimitive.Input.displayName;

const InputOTPViewer = React.forwardRef<
  React.ElementRef<typeof InputOTPPrimitive.Viewer>,
  React.ComponentPropsWithoutRef<typeof InputOTPPrimitive.Viewer>
>(({ className, ...props }, ref) => (
  <InputOTPPrimitive.Viewer
    ref={ref}
    className={cn('flex h-10 w-full items-center justify-between', className)}
    {...props}
  />
));
InputOTPViewer.displayName = 'InputOTPViewer';

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  InputOTPInput,
  InputOTPViewer,
};
