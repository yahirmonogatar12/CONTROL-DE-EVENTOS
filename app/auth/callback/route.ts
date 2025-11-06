import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Verificar si el usuario ya existe en la tabla users
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', data.user.email)
        .single()

      let userData = existingUser

      // Si no existe, crearlo automáticamente como usuario normal
      if (!existingUser) {
        const { data: newUser } = await supabase.from('users').insert({
          email: data.user.email,
          name: data.user.user_metadata.full_name || data.user.email?.split('@')[0],
          role: 'user',
          password: '', // No se usa para OAuth
        }).select().single()

        userData = newUser
      }

      // Guardar usuario en localStorage para que se sincronice con auth-context
      if (userData) {
        const userForStorage = {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          name: userData.name,
        }
        
        // Crear un script para guardar en localStorage desde el cliente
        const response = NextResponse.redirect(new URL('/', requestUrl.origin))
        response.headers.set('Set-Cookie', `user_data=${JSON.stringify(userForStorage)}; Path=/; Max-Age=86400; SameSite=Lax`)
        return response
      }
    }
  }

  // Redirigir al inicio
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
