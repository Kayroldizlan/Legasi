export * from "./database";

export type ViewMode = "grid" | "list";
export type DirectorySort = "newest" | "alphabetical" | "most_connected";

export interface DirectoryFilters {
  query: string;
  occupation: string;
  city: string;
  country: string;
  company: string;
  relation: string;
  category?: string;
  sort: DirectorySort;
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
