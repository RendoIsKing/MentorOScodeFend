import { useApplicationUserContext } from "@/context/ApplicationUser";

export default function useAuthentication() {
  const { user } = useApplicationUserContext();

  return {
    user,
  };
}
