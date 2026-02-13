// alert.js
import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import "./alert.css";

const getIcon = (variant) => {
  switch (variant) {
    case "success":
      return <CheckCircle2 className="alert-icon" />;
    case "error":
      return <XCircle className="alert-icon" />;
    case "warning":
      return <AlertTriangle className="alert-icon" />;
    default:
      return <AlertCircle className="alert-icon" />;
  }
};
export const AlertDescription = ({ className = "", ...props }) => (
  <div className={`alert-description ${className}`} {...props} />
);

export const Alert = ({
  children,
  variant = "default",
  title,
  description,
  className = "",
  onClose,
  ...props
}) => {
  return (
    <div
      role="alert"
      className={`alert alert-${variant} ${className}`}
      {...props}
    >
      <div className="alert-content">
        {getIcon(variant)}
        <div className="alert-text">
          {title && <div className="alert-title">{title}</div>}
          {description && (
            <div className="alert-description">{description}</div>
          )}
          {children}
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="alert-close">
          <XCircle className="alert-close-icon" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
};
