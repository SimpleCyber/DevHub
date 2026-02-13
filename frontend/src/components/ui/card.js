import * as React from "react";

// Card Components with enhanced styling and features
const Card = React.forwardRef(
  ({ className, variant = "default", hover = false, ...props }, ref) => {
    const baseStyles = "rounded-xl transition-all duration-300";
    const variants = {
      default: "bg-white dark:bg-gray-800 border shadow-sm",
      elevated: "bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl",
      outlined: "border-2 border-gray-200 dark:border-gray-700",
      gradient:
        "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900",
    };

    const hoverEffect = hover ? "hover:transform hover:-translate-y-1" : "";

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${hoverEffect} ${className}`}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

const CardHeader = React.forwardRef(
  ({ className, withBorder = false, ...props }, ref) => {
    const borderStyle = withBorder ? "border-b dark:border-gray-700" : "";

    return (
      <div
        ref={ref}
        className={`flex flex-col space-y-1.5 p-6 ${borderStyle} ${className}`}
        {...props}
      />
    );
  },
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(
  ({ className, size = "default", ...props }, ref) => {
    const sizes = {
      small: "text-lg",
      default: "text-2xl",
      large: "text-3xl",
    };

    return (
      <h3
        ref={ref}
        className={`${sizes[size]} font-semibold leading-none tracking-tight ${className}`}
        {...props}
      />
    );
  },
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(
  ({ className, padded = true, ...props }, ref) => {
    const padding = padded ? "p-6" : "p-0";
    return <div ref={ref} className={`${padding} ${className}`} {...props} />;
  },
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(
  ({ className, withBorder = false, ...props }, ref) => {
    const borderStyle = withBorder ? "border-t dark:border-gray-700" : "";

    return (
      <div
        ref={ref}
        className={`flex items-center p-6 ${borderStyle} ${className}`}
        {...props}
      />
    );
  },
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
