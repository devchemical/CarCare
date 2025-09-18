import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("OAuth callback - Code:", code ? "Present" : "Missing");
  console.log("OAuth callback - Origin:", origin);
  console.log("OAuth callback - Next:", next);

  if (code) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    console.log("OAuth callback - Exchange result:", { 
      success: !error, 
      error: error?.message,
      user: data?.user?.email 
    });

    if (!error && data?.user) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      console.log("OAuth callback - Redirect info:", { 
        isLocalEnv, 
        forwardedHost, 
        origin 
      });

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      console.error("OAuth callback - Authentication failed:", error?.message);
      return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error?.message || 'Authentication failed')}`);
    }
  }

  console.log("OAuth callback - No code provided, redirecting to error");
  return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent('No authorization code provided')}`);
}
