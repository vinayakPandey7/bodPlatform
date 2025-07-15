import React from "react";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

export const Spinner: React.FC<{
  size?: string;
  color?: string;
  className?: string;
}> = ({ size = "w-8 h-8", color = "border-blue-600", className = "" }) => (
  <div className={`${size} ${className}`}>
    <div
      className={`animate-spin rounded-full border-2 border-gray-200 ${color} border-t-transparent w-full h-full`}
    ></div>
  </div>
);

export const Loader: React.FC<LoaderProps> = ({
  size = "md",
  color = "border-blue-600",
  text,
  className = "",
}) => {
  const spinnerSize = sizeClasses[size];

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <Spinner size={spinnerSize} color={color} />
      {text && (
        <p className="text-gray-600 text-sm font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export const FullPageLoader: React.FC<{ text?: string }> = ({
  text = "Loading...",
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader size="xl" text={text} />
    </div>
  </div>
);

export const InlineLoader: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center justify-center py-8">
    <Loader size="md" text={text} />
  </div>
);

export default Loader;
