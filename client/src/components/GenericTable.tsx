"use client";
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

// Types for column configuration
export interface TableColumn<T = any> {
  key: string;
  label: string;
  type: "text" | "badge" | "actions" | "custom" | "number";
  width?: string;
  responsive?: "always" | "sm" | "md" | "lg"; // Show on these breakpoints and up
  sortable?: boolean;
  searchable?: boolean;
  render?: (value: any, row: T, column: TableColumn<T>) => React.ReactNode;
  badgeConfig?: BadgeConfig;
  className?: string;
}

export interface BadgeConfig {
  colorMap: Record<string, string>;
  formatValue?: (value: any) => string;
  iconMap?: Record<string, string>; // New for gradient badges
}

export interface TableAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: "default" | "danger" | "warning" | "success";
  show?: (row: T) => boolean;
}

export interface FilterButton {
  key: string;
  label: string;
  count?: number;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  onClick: () => void;
}

export interface StatCard {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
}

export interface GenericTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  error?: string | null;
  searchPlaceholder?: string;
  onSearch?: (searchTerm: string) => void;
  searchable?: boolean;
  title?: string;
  addButton?: {
    label: string;
    onClick: () => void;
  };
  emptyMessage?: string;
  className?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  onRowClick?: (row: T) => void;
  filterButtons?: FilterButton[];
  activeFilter?: string;
  statCards?: StatCard[];
  tableHeight?: string; // Configurable table height
  enableTableScroll?: boolean; // Enable/disable table internal scrolling
}

// Action Dropdown Component
interface ActionDropdownProps<T> {
  actions: TableAction<T>[];
  row: T;
  rowId: string;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
}

function ActionDropdown<T>({
  actions,
  row,
  rowId,
  activeDropdown,
  setActiveDropdown,
}: ActionDropdownProps<T>) {
  const [buttonPosition, setButtonPosition] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const visibleActions = actions.filter(action => !action.show || action.show(row));

  // Clear button position when dropdown is closed externally
  React.useEffect(() => {
    if (activeDropdown !== rowId) {
      setButtonPosition(null);
    }
  }, [activeDropdown, rowId]);

  if (visibleActions.length === 0) return null;

  const getActionVariantClass = (variant: string = "default") => {
    switch (variant) {
      case "danger":
        return "text-red-600 hover:bg-red-50";
      case "warning":
        return "text-yellow-600 hover:bg-yellow-50";
      case "success":
        return "text-green-600 hover:bg-green-50";
      default:
        return "text-gray-700 hover:bg-gray-100";
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to row click
    
    if (activeDropdown === rowId) {
      setActiveDropdown(null);
      setButtonPosition(null);
    } else {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setButtonPosition({
          top: rect.bottom + window.scrollY + 4,
          right: window.innerWidth - rect.right + window.scrollX,
        });
      }
      setActiveDropdown(rowId);
    }
  };

  const dropdown = activeDropdown === rowId && buttonPosition && (
    <div 
      className="fixed w-48 bg-white rounded-md shadow-lg border border-gray-200 z-[9999]"
      data-dropdown-menu={rowId}
      style={{
        top: buttonPosition.top,
        right: buttonPosition.right,
      }}
    >
      <div className="py-1">
        {visibleActions.map((action, index) => (
          <React.Fragment key={index}>
            {action.variant === "danger" && index > 0 && (
              <div className="border-t border-gray-100 my-1"></div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling to row click
                action.onClick(row);
                setActiveDropdown(null);
                setButtonPosition(null);
              }}
              className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${getActionVariantClass(action.variant)}`}
            >
              {action.icon && (
                <span className="w-4 h-4 mr-3">{action.icon}</span>
              )}
              {action.label}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative" data-dropdown-id={rowId}>
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className="text-gray-400 hover:text-gray-600 p-2 rounded hover:bg-gray-50 transition-colors"
        title="Actions"
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {dropdown && typeof window !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  );
}

// Filter Buttons Component
interface FilterButtonsProps {
  buttons: FilterButton[];
  activeFilter?: string;
}

function FilterButtons({ buttons, activeFilter }: FilterButtonsProps) {
  const getButtonClasses = (button: FilterButton) => {
    const baseClasses = "px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1";
    const isActive = activeFilter === button.key;
    
    if (isActive) {
      switch (button.variant) {
        case "warning":
          return `${baseClasses} bg-gradient-to-r from-amber-500 to-orange-500 text-white`;
        case "success":
          return `${baseClasses} bg-gradient-to-r from-emerald-500 to-green-600 text-white`;
        case "danger":
          return `${baseClasses} bg-gradient-to-r from-red-500 to-rose-600 text-white`;
        case "secondary":
          return `${baseClasses} bg-gradient-to-r from-blue-500 to-cyan-600 text-white`;
        default:
          return `${baseClasses} bg-gradient-to-r from-purple-600 to-indigo-600 text-white`;
      }
    } else {
      const variantClasses = {
        warning: "text-amber-600 border-amber-200 hover:border-amber-400",
        success: "text-emerald-600 border-emerald-200 hover:border-emerald-400",
        danger: "text-red-600 border-red-200 hover:border-red-400",
        secondary: "text-blue-600 border-blue-200 hover:border-blue-400",
        primary: "text-purple-600 border-purple-200 hover:border-purple-400",
      };
      const variantClass = variantClasses[button.variant || "primary"];
      return `${baseClasses} bg-white ${variantClass} border-2`;
    }
  };

  return (
    <div className="flex space-x-3">
      {buttons.map((button) => (
        <button
          key={button.key}
          onClick={button.onClick}
          className={getButtonClasses(button)}
        >
          {button.label}
          {button.count !== undefined && ` (${button.count})`}
        </button>
      ))}
    </div>
  );
}

// Statistics Cards Component
interface StatCardsProps {
  cards: StatCard[];
}

function StatCards({ cards }: StatCardsProps) {
  const getCardClasses = (variant?: string) => {
    const baseClasses = "bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2";
    const borderClasses: Record<string, string> = {
      warning: "border-amber-100",
      success: "border-emerald-100", 
      danger: "border-red-100",
      secondary: "border-blue-100",
      primary: "border-purple-100",
    };
    return `${baseClasses} border ${borderClasses[variant || "primary"]}`;
  };

  const getIconClasses = (variant?: string) => {
    const gradientClasses: Record<string, string> = {
      warning: "bg-gradient-to-r from-amber-500 to-orange-500",
      success: "bg-gradient-to-r from-emerald-500 to-green-600",
      danger: "bg-gradient-to-r from-red-500 to-rose-600",
      secondary: "bg-gradient-to-r from-blue-500 to-cyan-600",
      primary: "bg-gradient-to-r from-purple-500 to-indigo-500",
    };
    return `p-3 ${gradientClasses[variant || "primary"]} rounded-xl shadow-lg`;
  };

  const getValueClasses = (variant?: string) => {
    const gradientClasses: Record<string, string> = {
      warning: "bg-gradient-to-r from-amber-500 to-orange-500",
      success: "bg-gradient-to-r from-emerald-500 to-green-600", 
      danger: "bg-gradient-to-r from-red-500 to-rose-600",
      secondary: "bg-gradient-to-r from-blue-500 to-cyan-600",
      primary: "bg-gradient-to-r from-purple-600 to-indigo-600",
    };
    return `text-4xl font-bold ${gradientClasses[variant || "primary"]} bg-clip-text text-transparent`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className={getCardClasses(card.variant)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {card.title}
              </p>
              <p className={getValueClasses(card.variant)}>
                {card.value}
              </p>
              {card.subtitle && (
                <p className="text-xs text-gray-500 mt-1">
                  {card.subtitle}
                </p>
              )}
            </div>
            {card.icon && (
              <div className={getIconClasses(card.variant)}>
                <div className="w-8 h-8 text-white">
                  {card.icon}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Badge Component
interface BadgeProps {
  value: any;
  config: BadgeConfig;
}

function Badge({ value, config }: BadgeProps) {
  const displayValue = config.formatValue ? config.formatValue(value) : value;
  const colorClass = config.colorMap[value] || "bg-gray-100 text-gray-800";
  
  // Check if this is a gradient badge (contains 'from-' or 'bg-gradient-to-r')
  const isGradient = colorClass.includes('from-') || colorClass.includes('bg-gradient-to-r');
  
  // If gradient badge, handle the complex styling
  if (isGradient && config.iconMap && config.iconMap[value]) {
    const iconPath = config.iconMap[value];
    return (
      <span
        className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r ${colorClass} shadow-lg transform hover:scale-105 transition-all duration-300`}
      >
        <svg
          className="w-4 h-4 mr-1.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d={iconPath}
          />
        </svg>
        {displayValue}
      </span>
    );
  }

  // Standard badge styling
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {displayValue}
    </span>
  );
}

// Loading Skeleton Component
interface LoadingSkeletonProps {
  columns: TableColumn[];
  rows?: number;
}

function LoadingSkeleton({ columns, rows = 5 }: LoadingSkeletonProps) {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="bg-white shadow rounded-lg">
        <div className="h-16 bg-gray-200 rounded-t-lg mb-4"></div>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 border-b border-gray-200"></div>
        ))}
      </div>
    </div>
  );
}

// Main Generic Table Component
export function GenericTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  error = null,
  searchPlaceholder = "Search...",
  onSearch,
  searchable = true,
  title,
  addButton,
  emptyMessage = "No data found",
  className = "",
  rowClassName = "",
  onRowClick,
  filterButtons,
  activeFilter,
  statCards,
  tableHeight = "auto",
  enableTableScroll = false,
}: GenericTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Close dropdown when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const target = event.target as Element;
        const dropdownButton = document.querySelector(
          `[data-dropdown-id="${activeDropdown}"]`
        );
        
        // Check if click is on the dropdown button or inside any dropdown menu
        const isClickOnButton = dropdownButton && dropdownButton.contains(target);
        const isClickInDropdown = target.closest(`[data-dropdown-menu="${activeDropdown}"]`);

        if (!isClickOnButton && !isClickInDropdown) {
          setActiveDropdown(null);
        }
      }
    };

    const handleScroll = () => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [activeDropdown]);

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Filter data based on search term (if no external search handler)
  const filteredData = useMemo(() => {
    if (!searchTerm || onSearch) return data;

    return data.filter((row) => {
      return columns.some((column) => {
        if (!column.searchable) return false;
        const value = row[column.key];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns, onSearch]);

  // Get responsive classes for columns
  const getColumnClasses = (column: TableColumn) => {
    const baseClasses = "px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
    
    switch (column.responsive) {
      case "sm":
        return `hidden sm:table-cell ${baseClasses}`;
      case "md":
        return `hidden md:table-cell ${baseClasses}`;
      case "lg":
        return `hidden lg:table-cell ${baseClasses}`;
      default:
        return baseClasses;
    }
  };

  const getCellClasses = (column: TableColumn) => {
    const baseClasses = "px-6 py-4 whitespace-nowrap text-sm";
    
    switch (column.responsive) {
      case "sm":
        return `hidden sm:table-cell ${baseClasses}`;
      case "md":
        return `hidden md:table-cell ${baseClasses}`;
      case "lg":
        return `hidden lg:table-cell ${baseClasses}`;
      default:
        return baseClasses;
    }
  };

  // Render cell content based on column type
  const renderCellContent = (row: T, column: TableColumn<T>) => {
    const value = row[column.key];

    if (column.render) {
      return column.render(value, row, column);
    }

    switch (column.type) {
      case "badge":
        return column.badgeConfig ? (
          <Badge value={value} config={column.badgeConfig} />
        ) : (
          value
        );
      case "actions":
        return (
          <ActionDropdown
            actions={actions}
            row={row}
            rowId={row._id || row.id || String(Math.random())}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        );
      case "number":
        return typeof value === "number" ? value.toLocaleString() : value;
      default:
        return value;
    }
  };

  if (loading) {
    return <LoadingSkeleton columns={columns} />;
  }

  return (
    <div className={`min-h-screen ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        {(title || addButton) && (
          <div className="flex justify-between items-center">
            {title && (
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            )}
            {addButton && (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                onClick={addButton.onClick}
              >
                {addButton.label}
              </button>
            )}
          </div>
        )}

        {/* Filter Buttons */}
        {filterButtons && filterButtons.length > 0 && (
          <div className="bg-white shadow-sm border-b border-gray-100 p-6">
            <FilterButtons buttons={filterButtons} activeFilter={activeFilter} />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        {statCards && statCards.length > 0 && (
          <StatCards cards={statCards} />
        )}

        {/* Search Bar */}
        {searchable && (
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            {searchTerm && !onSearch && (
              <p className="mt-2 text-sm text-gray-600">
                Showing {filteredData.length} of {data.length} results
              </p>
            )}
          </div>
        )}

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div 
            className={`overflow-x-auto ${enableTableScroll ? 'overflow-y-auto' : ''}`}
            style={{ 
              maxHeight: enableTableScroll && tableHeight !== "auto" ? tableHeight : undefined,
              height: tableHeight !== "auto" && !enableTableScroll ? tableHeight : undefined
            }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Serial Number Column */}
                  <th className="w-16 px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No
                  </th>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`${getColumnClasses(column)} ${column.width ? `w-${column.width}` : ""} ${column.className || ""}`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-6 py-16 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-12 h-12 text-gray-300 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <p className="text-lg font-medium">{emptyMessage}</p>
                        {searchTerm && !onSearch && (
                          <p className="text-sm mt-1">Try adjusting your search terms</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, index) => {
                    const rowClasses = typeof rowClassName === "function" 
                      ? rowClassName(row, index) 
                      : rowClassName;
                    
                    return (
                      <tr
                        key={row._id || row.id || index}
                        className={`hover:bg-gray-50 transition-colors ${rowClasses} ${onRowClick ? "cursor-pointer" : ""}`}
                        onClick={() => onRowClick?.(row)}
                      >
                        {/* Serial Number */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className={`${getCellClasses(column)} ${column.type === "actions" ? "font-medium" : ""} ${
                              column.key === columns[0]?.key ? "font-medium text-gray-900" : "text-gray-900"
                            } ${column.width ? `w-${column.width}` : ""} truncate`}
                          >
                            {renderCellContent(row, column)}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenericTable; 