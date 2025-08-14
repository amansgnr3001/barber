import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:from-amber-600 hover:to-amber-700",
        destructive:
          "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40",
        outline:
          "border border-amber-500/30 bg-transparent text-gray-300 hover:text-white hover:bg-gray-800/50 hover:border-amber-500/50",
        secondary:
          "bg-gradient-to-r from-gray-800 to-black text-amber-500 border border-amber-500/30 shadow-lg hover:shadow-amber-500/20 hover:border-amber-500/50",
        ghost: "text-gray-300 hover:text-white hover:bg-gray-800/50",
        link: "text-amber-500 underline-offset-4 hover:underline hover:text-amber-400",
        gradient: "bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:from-amber-500 hover:to-amber-700",
        dark: "bg-gray-900 border border-amber-500/20 text-white hover:bg-gray-800 hover:border-amber-500/40 shadow-lg shadow-amber-500/10",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-8 text-base",
        xl: "h-14 rounded-md px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
