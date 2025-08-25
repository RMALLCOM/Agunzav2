import React from "react";

export const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl border border-white/50 ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

export const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 pt-6 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-xl font-bold ${className}`}>{children}</h3>
);