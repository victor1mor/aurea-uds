import React from "react";
import { type ColumnDef, type SortingState, type RowSelectionState, type ColumnFiltersState, type VisibilityState, type ColumnSizingState } from "@tanstack/react-table";
import { type UniversalState } from "./internal.js";
import { type IconName } from "./system.js";
export type { ColumnDef, SortingState, RowSelectionState, ColumnFiltersState, VisibilityState, ColumnSizingState } from "@tanstack/react-table";
export interface GridFilterSpec {
    column: string;
    label: string;
    facet?: boolean;
    options?: Array<{
        value: string;
        label: string;
    }>;
}
export declare function DataGrid<T>({ data, columns, label, filterable, pageSize, selectable, onSelectionChange, getRowId, className, sorting: sortingProp, onSortingChange, globalFilter: globalFilterProp, onGlobalFilterChange, page, onPageChange, rowSelection: rowSelectionProp, onRowSelectionChange, manualSorting, manualFiltering, manualPagination, rowCount, filters, columnFilters: columnFiltersProp, onColumnFiltersChange, bulkActions, stickyHeader, hideableColumns, columnVisibility: columnVisibilityProp, onColumnVisibilityChange, resizableColumns, columnSizing: columnSizingProp, onColumnSizingChange, state, stateMessage, renderDetail, detailRowId: detailRowIdProp, onDetailRowIdChange, onExport }: {
    data: T[];
    columns: Array<ColumnDef<T, any>>;
    label?: string;
    filterable?: boolean;
    pageSize?: number;
    selectable?: boolean;
    onSelectionChange?: (rows: T[]) => void;
    getRowId?: (row: T, index: number) => string;
    className?: string;
    sorting?: SortingState;
    onSortingChange?: (sorting: SortingState) => void;
    globalFilter?: string;
    onGlobalFilterChange?: (filter: string) => void;
    page?: number;
    onPageChange?: (page: number) => void;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: (selection: RowSelectionState) => void;
    manualSorting?: boolean;
    manualFiltering?: boolean;
    manualPagination?: boolean;
    rowCount?: number;
    filters?: GridFilterSpec[];
    columnFilters?: ColumnFiltersState;
    onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
    bulkActions?: Array<{
        id: string;
        label: string;
        icon?: IconName;
        onAction: (rows: T[], clear: () => void) => void;
    }>;
    stickyHeader?: boolean;
    hideableColumns?: boolean;
    columnVisibility?: VisibilityState;
    onColumnVisibilityChange?: (v: VisibilityState) => void;
    resizableColumns?: boolean;
    columnSizing?: ColumnSizingState;
    onColumnSizingChange?: (s: ColumnSizingState) => void;
    state?: "loading" | "error" | UniversalState;
    stateMessage?: string;
    renderDetail?: (row: T) => React.ReactNode;
    detailRowId?: string | null;
    onDetailRowIdChange?: (id: string | null) => void;
    onExport?: (rows: T[], scope: {
        count: number;
        filtered: boolean;
        selected: boolean;
    }) => void;
}): React.JSX.Element;
