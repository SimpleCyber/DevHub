"use client";

import React, { useState } from "react";
import { cn } from "../utils/cn";

const CollapsibleContext = React.createContext({
  open: false,
  toggle: () => {},
});

const Collapsible = ({
  children,
  className,
  open,
  defaultOpen = false,
  onOpenChange,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const openState = open !== undefined ? open : isOpen;
  const toggle = () => {
    const newState = !openState;
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  return (
    <CollapsibleContext.Provider value={{ open: openState, toggle }}>
      <div className={cn("", className)} {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
};

const CollapsibleTrigger = ({ children, className, ...props }) => {
  const { toggle } = React.useContext(CollapsibleContext);

  return (
    <div className={cn("", className)} onClick={toggle} {...props}>
      {children}
    </div>
  );
};

const CollapsibleContent = ({ children, className, ...props }) => {
  const { open } = React.useContext(CollapsibleContext);

  if (!open) return null;

  return (
    <div className={cn("overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
};

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
