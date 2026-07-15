import { useEffect, useState } from "react";
import {
  DEFAULT_LANDING_SETTINGS,
  fetchLandingSettings,
  type LandingSettings,
} from "./shopify";

export function useLandingSettings() {
  const [settings, setSettings] = useState<LandingSettings>(DEFAULT_LANDING_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchLandingSettings().then((s) => {
      if (!cancelled) {
        setSettings(s);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loaded };
}
