"use client";
import React from "react";
import {
  Breadcrumbs,
  Link,
  Typography,
  Box,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { NavigateNext as NavigateNextIcon } from "@mui/icons-material";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbNavigation({ items }: BreadcrumbNavigationProps) {
  const router = useRouter();

  const handleClick = (href: string) => {
    router.push(href);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{
          color: "text.secondary",
          fontSize: "0.875rem",
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return isLast || !item.href ? (
            <Typography
              key={index}
              color={isLast ? "text.primary" : "text.secondary"}
              variant="body2"
              fontWeight={isLast ? "medium" : "normal"}
            >
              {item.label}
            </Typography>
          ) : (
            <Link
              key={index}
              color="inherit"
              underline="hover"
              variant="body2"
              sx={{
                cursor: "pointer",
                transition: "color 0.2s ease-in-out",
                "&:hover": {
                  color: "primary.main",
                },
              }}
              onClick={() => handleClick(item.href!)}
            >
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
} 