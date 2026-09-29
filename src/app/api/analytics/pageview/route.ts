import { createClient } from "@supabase/supabase-js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEVICE_TYPES = new Set(["desktop", "tablet", "mobile"]);

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  let sameOrigin = false;
  try {
    sameOrigin = !!origin && new URL(origin).host === new URL(request.url).host;
  } catch {
    return new Response(null, { status: 403 });
  }
  if (!sameOrigin) return new Response(null, { status: 403 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const path = typeof body?.path === "string" ? body.path : "";
  const visitorId = typeof body?.visitorId === "string" ? body.visitorId : "";
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";
  const referrerHost = typeof body?.referrerHost === "string" ? body.referrerHost.slice(0, 200).toLowerCase() : "";
  const deviceType = typeof body?.deviceType === "string" ? body.deviceType : "";
  if (!path.startsWith("/") || path.startsWith("//") || path.length > 200 || path.includes("?")
      || !UUID.test(visitorId) || !UUID.test(sessionId) || !DEVICE_TYPES.has(deviceType)
      || (referrerHost && !/^[a-z0-9.-]+$/i.test(referrerHost))) {
    return new Response(null, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return new Response(null, { status: 503 });
  const supabase = createClient(url, key, {
    db: { schema: "ltf" },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await supabase.from("website_page_views").insert({
    page_path: path,
    visitor_id: visitorId,
    session_id: sessionId,
    referrer_host: referrerHost || null,
    device_type: deviceType,
  });
  if (error) return new Response(null, { status: 503 });
  return new Response(null, { status: 204 });
}
