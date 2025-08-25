import React from "react";

export const Button = ({ children, className = "", variant = "primary", ...props }) => {
  const base = "px-6 py-4 text-lg font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200";
  const styles = {
    primary: "bg-[#003595] text-white hover:bg-[#0a49c1] focus:ring-[#003595]",
    accent: "bg-[#E20C18] text-white hover:bg-[#ff2330] focus:ring-[#E20C18]",
    ghost: "bg-white/70 text-gray-900 hover:bg-white/90 focus:ring-gray-300 backdrop-blur-md",
    outline: "border border-gray-300 text-gray-900 hover:bg-gray-50",
  };
  return (
    <button className={`${base} ${styles[variant] || styles.primary} ${className}`} {...props}>
      {children}
    &lt;/button&gt;
  );
};