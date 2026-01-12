// src/components/ads/GamSlot.tsx
import { useEffect, useMemo } from "react";
import type { AdPlacementDto } from "../../services/adPlacementsService";

declare global {
  interface Window {
    googletag: any;
  }
}

function ensureGptScript() {
  const id = "gpt-script";
  if (document.getElementById(id)) return;

  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
  document.head.appendChild(s);
}

export default function GamSlot({ placement }: { placement: AdPlacementDto }) {
  const divId = useMemo(
    () => `gpt-${placement.key}-${Math.random().toString(36).slice(2)}`,
    [placement.key]
  );

  useEffect(() => {
    const path = placement.gamAdUnitPath ?? "";
    const sizes = placement.gamSizes ?? [];

    if (!path || !sizes.length) return;

    ensureGptScript();
    window.googletag = window.googletag || { cmd: [] };

    window.googletag.cmd.push(() => {
      try {
        const slot = window.googletag.defineSlot(path, sizes, divId);
        if (!slot) return;

        slot.addService(window.googletag.pubads());
        window.googletag.enableServices();
        window.googletag.display(divId);
      } catch {
        // ignore
      }
    });

    // Cleanup SPA navigation
    return () => {
      try {
        window.googletag?.cmd?.push(() => {
          const pubads = window.googletag.pubads?.();
          const slots = pubads?.getSlots?.() || [];
          const s = slots.find((x: any) => x.getSlotElementId?.() === divId);
          if (s) window.googletag.destroySlots([s]);
        });
      } catch {
        // ignore
      }
    };
  }, [placement.gamAdUnitPath, JSON.stringify(placement.gamSizes), divId]);

  return <div id={divId} />;
}
