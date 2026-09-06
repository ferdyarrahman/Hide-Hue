import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-full font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary: "bg-leaf text-white hover:bg-forest",
      secondary: "bg-moss text-white hover:bg-forest",
      ghost: "bg-transparent text-forest hover:bg-leaf/10",
    };

    const sizeStyles = {
      sm: "px-4 py-1.5 text-sm min-h-[40px]",
      md: "px-6 py-3 text-base min-h-[48px]",
      lg: "px-8 py-4 text-lg min-h-[56px]",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
