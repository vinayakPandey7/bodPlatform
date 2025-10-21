import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  href?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = "md",
  className = "",
  showText = true,
  href,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const content = (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* CIERO Logo */}
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg`}
      >
        <span className={`font-bold text-white ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
          CIERO
        </span>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-900 ${textSizeClasses[size]}`}>
            CIERO
          </span>
          <span className="text-xs text-gray-500 -mt-1">
            Recruitment Platform
          </span>
        </div>
      )}
    </div>
  );

  // If href is provided, wrap in Link
  if (href) {
    return (
      <Link href={href} className="cursor-pointer hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
