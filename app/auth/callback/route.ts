import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the correct origin/host for redirecting
      const forwardedHost = request.headers.get('x-forwarded-host')
      const forwardedProto = request.headers.get('x-forwarded-proto')
      
      let redirectUrl: string
      
      if (forwardedHost && forwardedProto) {
        // Production deployment (Vercel)
        redirectUrl = `${forwardedProto}://${forwardedHost}${next}`
      } else if (forwardedHost) {
        // Production deployment without protocol
        redirectUrl = `https://${forwardedHost}${next}`
      } else {
        // Local development
        redirectUrl = `${requestUrl.origin}${next}`
      }
      
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error`)
}
