import { useInternetIdentity } from "@caffeineai/core-infrastructure";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  principalText: string | null;
  login: () => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  const { identity, login, clear, loginStatus } = useInternetIdentity();

  const isLoading = loginStatus === "logging-in";
  const isAuthenticated = !!identity;
  const principalText = identity ? identity.getPrincipal().toText() : null;

  return {
    isAuthenticated,
    isLoading,
    principalText,
    login,
    logout: clear,
  };
}
