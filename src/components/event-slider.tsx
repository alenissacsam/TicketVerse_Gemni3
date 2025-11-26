"use client";

import { useEffect, useState } from "react";
import { TrendingCarousel } from "./trending-carousel";
import { getTrendingEvents } from "@/app/actions/get-trending-events";

export function EventSlider() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getTrendingEvents();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching trending events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) return null; // Or a loading skeleton
  if (events.length === 0) return null;

  return <TrendingCarousel events={events} />;
}
