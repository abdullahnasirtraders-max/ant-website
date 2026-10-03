import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Announcement, PublicConfig, Settings } from '../lib/types';

const defaults: Settings = { deliveryFee: 0, storeName: 'ANT — Abdullah Nasir Traders', phone: '', whatsapp: '', email: '', address: '', social: { facebook: '', instagram: '', youtube: '', tiktok: '' } };
const Ctx = createContext<{ settings: Settings; announcements: Announcement[]; config: PublicConfig | null }>({ settings: defaults, announcements: [], config: null });
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaults);
  const [announcements, setAnn] = useState<Announcement[]>([]);
  const [config, setConfig] = useState<PublicConfig | null>(null);
  useEffect(() => {
    api.get<{ settings: Settings }>('/settings').then((r) => setSettings(r.settings)).catch(() => {});
    api.get<{ announcements: Announcement[] }>('/announcements').then((r) => setAnn(r.announcements)).catch(() => {});
    api.get<PublicConfig>('/config/public').then(setConfig).catch(() => {});
  }, []);
  return <Ctx.Provider value={{ settings, announcements, config }}>{children}</Ctx.Provider>;
}
