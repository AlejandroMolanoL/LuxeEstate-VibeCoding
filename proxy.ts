import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  // 1. Refresh Supabase session cookies and get user
  const { supabase, user, response } = await updateSession(request);

  const pathname = request.nextUrl.pathname;

  // 2. Protect admin routes
  if (pathname.startsWith('/admin')) {
    // If user is not logged in, redirect to login page
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 3. Verify user role
    const isMasterAdmin = user.email === 'molanolozanoalejandro@gmail.com';

    if (!isMasterAdmin) {
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error || roleData?.role !== 'admin') {
        console.warn(`Unauthorized access attempt to ${pathname} by ${user.email} (ID: ${user.id})`);
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return response;
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
