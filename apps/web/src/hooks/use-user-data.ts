"use client";

import { getUserData } from "@/app/actions";
import { USER_QUERY_KEY } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

export default function useUserData() {
  const {
    data,
    isSuccess,
    error,
    isLoading,
    isPending,
    refetch,
    isFetchedAfterMount,
    isFetching,
    isRefetching,
  } = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: () => getUserData(),
  });
  return {
    data,
    isSuccess,
    error,
    isLoading,
    isPending,
    refetch,
    isFetchedAfterMount,
    isFetching,
    isRefetching,
  };
}
