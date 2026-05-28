/** Remove persisted Supabase auth tokens from browser storage after server sign-out. */
export function clearBrowserAuthSession() {
  if (typeof window === "undefined") return;

  const clearStore = (store: Storage) => {
    for (const key of Object.keys(store)) {
      if (key.startsWith("sb-") && key.includes("auth-token")) {
        store.removeItem(key);
      }
    }
  };

  clearStore(localStorage);
  clearStore(sessionStorage);
}
