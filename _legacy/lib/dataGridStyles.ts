import type { SxProps, Theme } from "@mui/material/styles";

// Shared MUI X DataGrid theming so every list page (Leads, Deals, Contacts,
// Accounts, Tasks, Reports) looks consistent with the app's existing
// light/dark palette instead of DataGrid's generic defaults.
export const getDataGridSx = (isDark: boolean): SxProps<Theme> => ({
  border: "none",
  bgcolor: isDark ? "#0A0A0A" : "#f9fbff",
  fontFamily: "inherit",

  "& .MuiDataGrid-columnHeaders": {
    bgcolor: isDark ? "#18181B" : "#E3ECFC",
    borderBottom: `1px solid ${isDark ? "#27272A" : "#E3ECFC"}`,
  },
  "& .MuiDataGrid-columnHeader": {
    outline: "none !important",
  },
  "& .MuiDataGrid-columnHeaderTitleContainer": {
    fontSize: "13px",
    fontWeight: 600,
    lineHeight: "18px",
  },
  "& .MuiDataGrid-columnSeparator": { display: "none" },

  "& .MuiDataGrid-cell": {
    borderBottom: `1px solid ${isDark ? "#18181B" : "#EFF6FF"}`,
    outline: "none !important",
    display: "flex",
    alignItems: "center",
  },
  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
    outline: "none !important",
  },

  "& .MuiDataGrid-row": {
    cursor: "pointer",
    "&:hover": {
      bgcolor: isDark ? "#0F0F0F" : "rgba(96, 165, 250, 0.04)",
    },
    "&.Mui-selected": {
      bgcolor: isDark ? "#18181B" : "#EFF6FF",
      "&:hover": { bgcolor: isDark ? "#18181B" : "#EFF6FF" },
    },
  },

  "& .MuiDataGrid-footerContainer": {
    borderTop: `1px solid ${isDark ? "#18181B" : "#EFF6FF"}`,
    bgcolor: isDark ? "#0A0A0A" : "#f9fbff",
  },
  "& .MuiDataGrid-selectedRowCount": {
    fontSize: "11px",
    color: isDark ? "#737373" : "#94A3B8",
  },
  "& .MuiTablePagination-root": {
    fontSize: "11px",
    color: isDark ? "#A1A1AA" : "#334155",
  },
  "& .MuiCheckbox-root": {
    color: "#E2E8F0",
  },
  "& .MuiCheckbox-root.Mui-checked, & .MuiCheckbox-root.MuiCheckbox-indeterminate": {
    color: "#1D4ED8",
  },
  "& .MuiDataGrid-virtualScroller": {
    bgcolor: isDark ? "#0A0A0A" : "#f9fbff",
  },
  "& .MuiDataGrid-overlay": {
    bgcolor: "transparent",
  },
});

export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
