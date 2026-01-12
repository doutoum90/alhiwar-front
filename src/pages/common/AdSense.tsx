// src/components/ads/AdSenseSlot.tsx
import { useEffect, useId } from "react";
import type { AdPlacementDto } from "../../services/adPlacementsService";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

function ensureAdSenseScript(clientId: string) {
  const id = "adsense-script";
  if (document.getElementById(id)) return;

  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
  s.crossOrigin = "anonymous";
  document.head.appendChild(s);
}

export default function AdSenseSlot({ placement }: { placement: AdPlacementDto }) {
  const insKey = useId();

  const client = placement.adsenseClientId ?? "";
  const slot = placement.adsenseSlotId ?? "";
  if (!client || !slot) return null;

  useEffect(() => {
    ensureAdSenseScript(client);

    // Render call
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // ignore
    }
    // insKey ensures new render when component remounts
  }, [client, slot, insKey]);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={placement.adsenseFormat ?? "auto"}
      data-full-width-responsive={placement.adsenseResponsive ? "true" : "false"}
    />
  );
}
