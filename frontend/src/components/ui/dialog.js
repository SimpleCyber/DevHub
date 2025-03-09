import React from "react";
import { cn } from "../utils/cn";

const Dialog = ({ children, open, onOpenChange }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg p-6 shadow-lg max-w-md w-full">
        {children}
      </div>
    </div>
  );
};

const DialogTrigger = ({ children, onClick }) => {
  return React.cloneElement(children, { onClick });
};

const DialogContent = ({ children, className, ...props }) => {
  return (
    <div className={cn("relative", className)} {...props}>
      {children}
    </div>
  );
};

const DialogHeader = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
};

const DialogTitle = ({ className, ...props }) => {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
};

const DialogDescription = ({ className, ...props }) => {
  return (
    <div
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
};

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
};
