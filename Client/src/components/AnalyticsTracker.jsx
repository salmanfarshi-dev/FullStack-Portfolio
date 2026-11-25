import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
const SESSION_KEY = "sf_analytics_session";

const getSessionId = () => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `sf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

const sendEvent = (payload) => {
  fetch(`${API_URL}/analytics/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, sessionId: getSessionId() }),
    keepalive: true,
  }).catch(() => {});
};

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Do not count private admin screens as public portfolio traffic.
    if (location.pathname.startsWith("/admin")) return undefined;

    const page = `${location.pathname}${location.search}`;
    sendEvent({ eventType: "page_view", page });
    sendEvent({ eventType: "visitor_ping", page });

    const heartbeat = window.setInterval(() => {
      sendEvent({ eventType: "visitor_ping", page });
    }, 30000);

    return () => window.clearInterval(heartbeat);
  }, [location.pathname, location.search]);

  return null;
};

export default AnalyticsTracker;
