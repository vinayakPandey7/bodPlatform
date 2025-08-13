import React from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Breadcrumbs, Link, Chip } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";

interface InsuranceAgent {
  _id: string;
  name: string;
  email: string;
}

interface SalesAgentHeaderProps {
  agent: InsuranceAgent | null;
}

export const SalesAgentHeader: React.FC<SalesAgentHeaderProps> = ({
  agent,
}) => {
  const router = useRouter();

  return (
    <Box sx={{ mb: 3 }}>
      <Breadcrumbs
        separator={<ChevronRight fontSize="small" />}
        sx={{ mb: 2 }}
        aria-label="breadcrumb"
      >
        <Link
          component="button"
          variant="body2"
          onClick={() => router.push("/sales/dashboard")}
          sx={{
            color: "text.secondary",
            textDecoration: "none",
            "&:hover": {
              color: "primary.main",
              textDecoration: "underline",
            },
          }}
        >
          Sales Dashboard
        </Link>
        <Typography variant="body2" color="text.secondary">
          {agent?.name}
        </Typography>
        <Typography variant="body2" color="text.primary">
          Clients
        </Typography>
      </Breadcrumbs>

      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 1, fontWeight: "bold" }}
      >
        {agent?.name} - Client Management
      </Typography>

      <Box
        sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}
      >
        <Chip
          label={`Email: ${agent?.email}`}
          variant="outlined"
          size="small"
        />
      </Box>
    </Box>
  );
};
