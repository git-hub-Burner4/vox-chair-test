export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { google } from "googleapis";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store tokens securely (e.g., in Supabase or session)
    // Example: await supabase.from('users').update({ google_tokens: tokens }).eq('id', userId);

    return NextResponse.json({ message: "Google Drive connected successfully" });
  } catch (error) {
    console.error("Error exchanging authorization code:", error);
    return NextResponse.json({ error: "Failed to connect Google Drive" }, { status: 500 });
  }
}