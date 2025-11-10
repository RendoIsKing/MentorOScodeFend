import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { normalizeMeResponse } from "@/lib/meAdapter";

export function useMeNormalized() {
  const hasSessionCookie = typeof document !== "undefined" && document.cookie.includes("auth_token=");
  const { data, isLoading, error, refetch } = useGetUserDetailsQuery(undefined, {
    skip: !hasSessionCookie,
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: false,
    refetchOnFocus: true,
  });
  const me = normalizeMeResponse(data);
  return { me, isLoading, error, refetch };
}


