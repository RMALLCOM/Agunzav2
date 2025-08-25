import React from "react";

export const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl border border-white/50 ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

export const CardHeader = ({ children, className = "" }) =&gt; (
  &lt;div className={`px-6 pt-6 ${className}`}&gt;{children}&lt;/div&gt;
);

export const CardTitle = ({ children, className = "" }) =&gt; (
  &lt;h3 className={`text-xl font-bold ${className}`}&gt;{children}&lt;/h3&gt;
);