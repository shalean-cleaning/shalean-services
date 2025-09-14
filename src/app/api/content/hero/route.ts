import { NextResponse } from "next/server";

import { withApiSafe } from "../../../../lib/api-safe";

export const dynamic = "force-dynamic";

export const GET = withApiSafe(async () => {
  const data = {
    title: "Book trusted cleaners in minutes",
    subtitle:
      "Professional cleaning services, trusted housekeepers, and reliable home care solutions.",
    imageUrl: "/images/placeholder.png",
    ctaText: "View Our Services",
    ctaHref: "/services",
  };

  return NextResponse.json(data);
});

