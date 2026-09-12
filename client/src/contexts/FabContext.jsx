import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const FabContext = createContext(null);

export function FabProvider({ children }) {
  const [fab, setFab] = useState(null); // { icon, onClick, title, id } | null

  const showFab = useCallback((config) => setFab(config), []);
  const hideFab = useCallback(() => setFab(null), []);

  const value = useMemo(() => ({ fab, showFab, hideFab }), [fab, showFab, hideFab]);

  return <FabContext.Provider value={value}>{children}</FabContext.Provider>;
}

export function useFab() {
  return useContext(FabContext);
}
