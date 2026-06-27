import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DateRange } from "@erp-digital-printing/ui/DateRangePicker";
import { fundTransferKeys } from "@infrastructure/fund-transfer/keys/fund-transfer.key";
import { useFundTransferDI } from "./useFundTransferDI";

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function useFundTransferTable() {
  const { getFundTransfersUseCase } = useFundTransferDI();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return {
      from: today,
      to: today,
    };
  });

  const startDateStr = dateRange?.from ? formatDate(dateRange.from) : undefined;
  const endDateStr = dateRange?.to ? formatDate(dateRange.to) : undefined;

  const { data: responseData, isLoading, refetch } = useQuery({
    queryKey: fundTransferKeys.list({
      page,
      limit: pageSize,
      startDate: startDateStr,
      endDate: endDateStr,
    }),
    queryFn: () =>
      getFundTransfersUseCase.execute({
        page,
        limit: pageSize,
        startDate: startDateStr,
        endDate: endDateStr,
      }),
  });

  const rawTransfers = useMemo(() => responseData?.data ?? [], [responseData?.data]);
  const totalEntries = responseData?.total ?? 0;
  const totalPages = responseData?.limit
    ? Math.ceil(totalEntries / responseData.limit)
    : 1;

  // Since BE doesn't support search parameter on GET fund-transfers,
  // we do local search filtering on the returned dataset.
  const transfers = useMemo(() => {
    if (!searchQuery) return rawTransfers;
    const query = searchQuery.toLowerCase();
    return rawTransfers.filter(
      (item) =>
        item.fromAccount.toLowerCase().includes(query) ||
        item.toAccount.toLowerCase().includes(query) ||
        item.notes.toLowerCase().includes(query) ||
        item.cashierName.toLowerCase().includes(query),
    );
  }, [rawTransfers, searchQuery]);

  return {
    transfers,
    totalEntries,
    totalPages,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    isLoading,
    refetch,
  };
}
