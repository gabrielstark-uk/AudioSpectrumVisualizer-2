import * as React from "react"
import { cn } from "../../lib/utils"

// Simple toast components without Radix UI dependencies
const ToastProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <>{children}</>
}

const ToastViewport: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
        className
      )}
      {...props}
    />
  )
}

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

const Toast: React.FC<ToastProps> = ({
  className,
  variant = "default",
  ...props
}) => {
  const variantClasses = {
    default: "border bg-background text-foreground",
    destructive: "border-destructive bg-destructive text-destructive-foreground"
  }

  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

const ToastAction: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium",
        className
      )}
      {...props}
    />
  )
}

const ToastClose: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 opacity-70 hover:opacity-100",
        className
      )}
      {...props}
    >
      ✕
    </button>
  )
}

const ToastTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  )
}

const ToastDescription: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  )
}

type ToastActionElement = React.ReactElement<typeof ToastAction>

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
}