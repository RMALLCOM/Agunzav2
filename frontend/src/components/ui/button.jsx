import React from "react";

export const Button = ({ children, className = "", variant = "primary", style = {}, ...props }) => {
  const base = "px-8 py-5 text-xl font-extrabold uppercase tracking-wide rounded-[14px] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm whitespace-nowrap";
  const styles = {
    primary: "bg-[#12356F] text-white hover:bg-[#184593] focus:ring-[#12356F]",
    accent: "bg-[#E20C18] text-white hover:bg-[#f52330] focus:ring-[#E20C18]",
    ghost: "bg-white/70 text-gray-900 hover:bg-white/90 focus:ring-gray-300 backdrop-blur-md",
    outline: "border border-gray-300 text-gray-900 hover:bg-gray-50",
  };
  return (
    <button className={`${base} ${styles[variant] || styles.primary} ${className}`} {...props}>
      {children}
    </button>
  );
};