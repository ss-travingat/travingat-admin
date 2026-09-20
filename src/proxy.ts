import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function proxy(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  const url = req.nextUrl;

  const isLoginPage = url.pathname === '/login';
  const isLoginApi = url.pathname === '/api/cms/login' || url.pathname === '/api/admin/login';

  if (isLoginPage || isLoginApi) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Require auth for every other route.
  // Django sets admin_session or cms_session cookies upon successful login.
  const hasAdminSession = req.cookies.has('admin_session');
  const hasCmsSession = req.cookies.has('cms_session');
  
  const isAuthenticated = hasAdminSession || hasCmsSession;

  if (isAuthenticated) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (url.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/login', req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match ALL routes except Next.js internals and static files.
     * The login page bypass is handled inside the middleware function above.
     */
    '/((?!_next/static|_next/image|favicon\\.ico).*)',
  ],
};
