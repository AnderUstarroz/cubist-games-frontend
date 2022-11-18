import { createContext, useContext, useState } from "react";

const SettingsContext = createContext(null);

export default function useSettings() {
  const [settings, setSettings]: any = useContext(SettingsContext);
  return [settings, setSettings];
}

export const SettingsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [settings, setSettings] = useState({});

  return (
    <SettingsContext.Provider value={[settings, setSettings] as any}>
      {children}
    </SettingsContext.Provider>
  );
};
