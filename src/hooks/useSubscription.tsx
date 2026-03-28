import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Stripe IDs
export const PLANS = {
  monthly: {
    price_id: "price_1TFJyGKdxulzRFjpW4SawzM1",
    product_id: "prod_UDlV40c08joSXy",
    label: "Mensual",
    price: "$4.99",
    interval: "mes",
  },
  annual: {
    price_id: "price_1TFJytKdxulzRFjpzEbSky46",
    product_id: "prod_UDlVLAjF6XJhSK",
    label: "Anual",
    price: "$39.99",
    interval: "año",
    savings: "33%",
  },
} as const;

interface SubscriptionCtx {
  isPremium: boolean;
  loading: boolean;
  subscriptionEnd: string | null;
  checkSubscription: () => Promise<void>;
  checkout: (planKey: "monthly" | "annual") => Promise<void>;
  openPortal: () => Promise<void>;
}

const SubCtx = createContext<SubscriptionCtx | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user, session } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setIsPremium(false);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setIsPremium(data?.subscribed ?? false);
      setSubscriptionEnd(data?.subscription_end ?? null);
    } catch (e) {
      console.error("check-subscription error:", e);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  // Check on auth change
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const checkout = useCallback(async (planKey: "monthly" | "annual") => {
    if (!session?.access_token) return;
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: PLANS[planKey].price_id },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e) {
      console.error("checkout error:", e);
    }
  }, [session?.access_token]);

  const openPortal = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e) {
      console.error("portal error:", e);
    }
  }, [session?.access_token]);

  return (
    <SubCtx.Provider value={{ isPremium, loading, subscriptionEnd, checkSubscription, checkout, openPortal }}>
      {children}
    </SubCtx.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubCtx);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
};
