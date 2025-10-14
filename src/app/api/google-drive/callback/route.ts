import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { storeDriveTokens, createRootFolder, createDriveClient } from '@/lib/google-drive';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This is the user ID
    const error = searchParams.get('error');

    if (error) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Connection Failed</title>
          </head>
          <body>
            <script>
              window.opener.postMessage('drive-connection-failed', window.location.origin);
              window.close();
            </script>
            <p>Connection failed. You can close this window.</p>
          </body>
        </html>
        `,
        {
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing authorization code or user ID' },
        { status: 400 }
      );
    }

    const userId = state;

    // Determine the callback URL based on environment (must match auth route)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    const callbackUrl = `${baseUrl}/api/google-drive/callback`;

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
      throw new Error('Invalid tokens received from Google');
    }

    // Store tokens in database
    await storeDriveTokens(userId, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      scope: tokens.scope || '',
    });

    // Create root folder in Drive
    const drive = createDriveClient({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expiry: new Date(tokens.expiry_date).toISOString(),
      scope: tokens.scope || '',
    });

    const rootFolderId = await createRootFolder(drive);

    // Update database with root folder ID
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    await supabase
      .from('user_google_drive')
      .update({ root_folder_id: rootFolderId })
      .eq('user_id', userId);

    // Return HTML that closes the popup and notifies parent
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Connected</title>
        </head>
        <body>
          <script>
            window.opener.postMessage('drive-connected', window.location.origin);
            window.close();
          </script>
          <p>Google Drive connected successfully! You can close this window.</p>
        </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Connection Failed</title>
        </head>
        <body>
          <script>
            window.opener.postMessage('drive-connection-failed', window.location.origin);
            window.close();
          </script>
          <p>Connection failed. You can close this window.</p>
        </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}
