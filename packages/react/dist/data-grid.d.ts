import React from "react";
import { type ColumnDef as ColumnDefDoMotor, type RowData, type SortingState, type RowSelectionState, type ColumnFiltersState, type ColumnVisibilityState, type ColumnSizingState } from "@tanstack/react-table";
import { type UniversalState } from "./internal.js";
import { type IconName } from "./system.js";
export type { SortingState, RowSelectionState, ColumnFiltersState, ColumnSizingState } from "@tanstack/react-table";
export type VisibilityState = ColumnVisibilityState;
declare const recursosDaGrade: {
    columnFilteringFeature: import("@tanstack/react-table").TableFeature;
    globalFilteringFeature: import("@tanstack/react-table").TableFeature;
    columnFacetingFeature: import("@tanstack/react-table").TableFeature;
    rowSortingFeature: import("@tanstack/react-table").TableFeature;
    rowPaginationFeature: import("@tanstack/react-table").TableFeature;
    rowSelectionFeature: import("@tanstack/react-table").TableFeature;
    columnVisibilityFeature: import("@tanstack/react-table").TableFeature;
    columnSizingFeature: import("@tanstack/react-table").TableFeature;
    columnResizingFeature: import("@tanstack/react-table").TableFeature;
    filteredRowModel: (table: import("@tanstack/react-table").Table<any, any>) => () => import("@tanstack/react-table").RowModel<any, any>;
    sortedRowModel: (table: import("@tanstack/react-table").Table<any, any>) => () => import("@tanstack/react-table").RowModel<any, any>;
    paginatedRowModel: (table: import("@tanstack/react-table").Table<any, any>) => () => import("@tanstack/react-table").RowModel<any, any>;
    facetedRowModel: (table: import("@tanstack/react-table").Table<any, any>, columnId: string) => () => import("@tanstack/react-table").RowModel<any, any>;
    facetedUniqueValues: (table: import("@tanstack/react-table").Table<import("@tanstack/react-table").TableFeatures, any>, columnId: string) => () => Map<any, number>;
    filterFns: {
        arrIncludes: import("@tanstack/react-table").CreatedFilterFn<any, any>;
        arrIncludesAll: import("@tanstack/react-table").CreatedFilterFn<any, any>;
        arrHas: import("@tanstack/react-table").CreatedFilterFn<any, any>;
        arrIncludesSome: import("@tanstack/react-table").CreatedFilterFn<any, any>;
        between: import("@tanstack/react-table").CreatedFilterFn<any, any>;
        betweenInclusive: import("@tanstack/react-table").CreatedFilterFn<any, any>;
        empty: import("@tanstack/react-table").CreatedFilterFn<any, any>;
        endsWith: import("@tanstack/react-table").CreatedFilterFn<any, any>;
        equals: import("@tanstack/react-table").CreatedFilterFn<any, any>;
        equalsString: import("@tanstack/react-table").CreatedFilterFn<any, any>;
        equalsStringSensitive: import("@tanstack/react-table").CreatedFilterFn<any, any>;
        inDateRange: import("@tanstack/react-table").CreatedFilterFn<any, any>;
        inNumberRange: import("@tanstack/react-table").CreatedFilterFn<any, any>;
        includesString: import("@tanstack/react-table").CreatedFilterFn<any, any>;
        includesStringSensitive: import("@tanstack/react-table").CreatedFilterFn<any, any>;
        notEmpty: import("@tanstack/react-table").CreatedFilterFn<any, any>;
        startsWith: import("@tanstack/react-table").CreatedFilterFn<any, any>;
        weakEquals: import("@tanstack/react-table").CreatedFilterFn<any, any>;
    };
    sortFns: {
        alphanumeric: import("@tanstack/react-table").CreatedSortFn<any, any>;
        alphanumericCaseSensitive: import("@tanstack/react-table").CreatedSortFn<any, any>;
        basic: import("@tanstack/react-table").CreatedSortFn<any, any>;
        datetime: import("@tanstack/react-table").CreatedSortFn<any, any>;
        text: import("@tanstack/react-table").CreatedSortFn<any, any>;
        textCaseSensitive: import("@tanstack/react-table").CreatedSortFn<any, any>;
    };
};
/** O conjunto de recursos do motor que a `DataGrid` registra — para quem tipa colunas com o `createColumnHelper` do motor. */
export type DataGridFeatures = typeof recursosDaGrade;
/** A definição de coluna da `DataGrid`: o `ColumnDef` da TanStack Table 9 com os recursos da grade já escolhidos. */
export type ColumnDef<TData extends RowData, TValue = any> = ColumnDefDoMotor<DataGridFeatures, TData, TValue>;
export interface GridFilterSpec {
    column: string;
    label: string;
    facet?: boolean;
    options?: Array<{
        value: string;
        label: string;
    }>;
}
export declare function DataGrid<T extends RowData>({ data, columns, label, filterable, pageSize, selectable, onSelectionChange, getRowId, className, sorting: sortingProp, onSortingChange, globalFilter: globalFilterProp, onGlobalFilterChange, page, onPageChange, rowSelection: rowSelectionProp, onRowSelectionChange, manualSorting, manualFiltering, manualPagination, rowCount, filters, columnFilters: columnFiltersProp, onColumnFiltersChange, bulkActions, stickyHeader, dividers, fit, hideableColumns, columnVisibility: columnVisibilityProp, onColumnVisibilityChange, resizableColumns, columnSizing: columnSizingProp, onColumnSizingChange, state, stateMessage, renderDetail, detailRowId: detailRowIdProp, onDetailRowIdChange, onExport }: {
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
    stickyHeader?: boolean | "page";
    dividers?: boolean;
    fit?: boolean;
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
