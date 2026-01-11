import { Container, Flex } from "@chakra-ui/react";
import type { PublicLayoutProps } from "../../types";
import Footer from "../common/Footer";
import Header from "../common/Header";
import { useState, useEffect } from "react";
import CacheConsentModal from "../common/CacheConsentModal";
import { getCacheConsent } from "../../utils/utils";

function clearNonEssentialStorage() {
  const keep = new Set([
    "cache_consent",
  ]);

  try {
    const keys = Object.keys(localStorage);
    for (const k of keys) {
      if (!keep.has(k)) localStorage.removeItem(k);
    }
  } catch { }

  try {
    sessionStorage.clear();
  } catch { }

  (async () => {
    try {
      if (!("caches" in window)) return;
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    } catch { }
  })();
  try {
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = (eqPos > -1 ? c.substring(0, eqPos) : c).trim();
      if (name === "cache_consent") return;

      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  } catch { }
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const consent = getCacheConsent();
    if (!consent) setOpen(true);
  }, []);

  return (
    <>
      <CacheConsentModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onAccepted={() => {
        }}
        onRejected={() => {
          clearNonEssentialStorage();
        }}
      />
      <Flex direction="column" minH="100dvh" bg="gray.50">
        <Header />
        <Container maxW="6xl" flex="1" py={{ base: 6, md: 10 }}>
          {children}
        </Container>
        <Footer />
      </Flex>
    </>

  );
};

