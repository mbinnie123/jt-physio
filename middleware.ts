import { NextRequest, NextResponse } from "next/server";

const OLD_DOMAIN = "www.jtfootballphysiotherapy.co.uk";
const OLD_DOMAIN_BARE = "jtfootballphysiotherapy.co.uk";
const NEW_DOMAIN = "www.jordanphysiotherapyayrshire.co.uk";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  if (host === OLD_DOMAIN || host === OLD_DOMAIN_BARE) {
    const url = request.nextUrl.clone();
    url.hostname = NEW_DOMAIN;
    url.port = "";
    return NextResponse.redirect(url, { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
