import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

const getBaseUrl = (requestUrl: URL) => {
  if (requestUrl.hostname !== 'localhost') {
    return 'https://control-de-eventos.vercel.app'
  }
  return requestUrl.origin
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const baseUrl = getBaseUrl(requestUrl)

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', data.user.email)
        .single()

      let userData = existingUser

      if (!existingUser) {
        const { data: newUser } = await supabase.from('users').insert({
          email: data.user.email,
          name: data.user.user_metadata.full_name || data.user.email?.split('@')[0],
          role: 'user',
          password: '',
        }).select().single()

        userData = newUser
      }

      if (userData) {
        const userForStorage = {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          name: userData.name,
        }

        const response = NextResponse.redirect(new URL('/', baseUrl))
        response.headers.set('Set-Cookie', `user_data=${JSON.stringify(userForStorage)}; Path=/; Max-Age=86400; SameSite=Lax`)
        return response
      }
    }
  }

  return NextResponse.redirect(new URL('/', baseUrl))
}
