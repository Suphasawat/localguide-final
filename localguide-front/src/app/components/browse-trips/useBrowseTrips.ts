import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { tripRequireAPI } from "../../lib/api";

export interface Province {
  ID: number;
  Name: string;
}

export interface TripRequire {
  ID: number;
  Title: string;
  Description: string;
  MinPrice: number;
  MaxPrice: number;
  StartDate: string;
  EndDate: string;
  Days: number;
  GroupSize: number;
  Status: string;
  province_name?: string;
  user_name?: string;
  Province?: Province;
}

interface BrowseResponse {
  tripRequires?: TripRequire[];
  trip_requires?: TripRequire[];
}

export function useBrowseTrips() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<TripRequire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await tripRequireAPI.browse();
      const body: BrowseResponse | TripRequire[] = res?.data;
      const list =
        (Array.isArray(body)
          ? body
          : body?.tripRequires ?? body?.trip_requires) ?? [];
      setItems(list);
    } catch {
      setError("ไม่สามารถโหลดข้อมูลได้");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }
    if (user?.role !== 2) {
      router.replace("/dashboard");
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user?.role]);

  return {
    items,
    loading: authLoading || loading,
    error,
    reload: load,
  };
}
