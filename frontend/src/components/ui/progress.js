import * as React from "react";

const Progress = React.forwardRef(
  (
    {
      value = 0,
      variant = "default",
      size = "default",
      showLabel = false,
      animated = true,
      className,
      ...props
    },
    ref,
  ) => {
    // Ensure value is between 0 and 100
    const normalizedValue = Math.min(Math.max(value, 0), 100);

    const variants = {
      default: "bg-blue-600 dark:bg-blue-500",
      success: "bg-green-600 dark:bg-green-500",
      warning: "bg-yellow-600 dark:bg-yellow-500",
      error: "bg-red-600 dark:bg-red-500",
      gradient: "bg-gradient-to-r from-blue-600 to-indigo-600",
    };

    const sizes = {
      sm: "h-2",
      default: "h-4",
      lg: "h-6",
    };

    const animation = animated ? "transition-all duration-300 ease-in-out" : "";

    const progressStyle = {
      width: `${normalizedValue}%`,
    };

    return (
      <div className="w-full">
        {showLabel && (
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.round(normalizedValue)}%
            </span>
          </div>
        )}
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={normalizedValue}
          aria-valuemin={0}
          aria-valuemax={100}
          className={`
          relative w-full overflow-hidden rounded-full 
          bg-gray-200 dark:bg-gray-700 
          ${sizes[size]} ${className}
        `}
          {...props}
        >
          <div
            className={`
            absolute left-0 top-0 h-full 
            rounded-full 
            ${variants[variant]} 
            ${animation}
          `}
            style={progressStyle}
          >
            {variant === "gradient" && (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent to-white/20 animate-shimmer" />
            )}
          </div>
        </div>
      </div>
    );
  },
);

Progress.displayName = "Progress";

export { Progress };
