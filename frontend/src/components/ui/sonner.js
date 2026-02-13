import React from "react";

export const Toaster = ({ className, ...props }) => {
  return (
    <div
      id="sonner-toaster"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      {...props}
    />
  );
};

export const toast = {
  success: (message) => {
    const toaster = document.getElementById("sonner-toaster");
    if (toaster) {
      const toast = document.createElement("div");
      toast.className =
        "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative";
      toast.innerHTML = message;
      toaster.appendChild(toast);
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }
  },
  error: (message) => {
    const toaster = document.getElementById("sonner-toaster");
    if (toaster) {
      const toast = document.createElement("div");
      toast.className =
        "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative";
      toast.innerHTML = message;
      toaster.appendChild(toast);
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }
  },
};
