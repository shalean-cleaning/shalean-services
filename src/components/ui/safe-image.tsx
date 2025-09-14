"use client";
import Image, { ImageProps } from "next/image";
import { useState, useMemo } from "react";

type Props = ImageProps & { fallbackSrc?: string };

export default function SafeImage({
  src,
  alt,
  fallbackSrc = "/images/placeholder-card.svg",
  ...rest
}: Props) {
  const initial = useMemo(() => (typeof src === "string" ? src : (src as any)), [src]);
  const [current, setCurrent] = useState(initial);

  return (
    <Image
      {...rest}
      alt={alt}
      src={current}
      onError={() => {
        if (current !== fallbackSrc) setCurrent(fallbackSrc);
      }}
      // If needed in dev: set NEXT_PUBLIC_IMAGE_UNOPTIMIZED=1
      unoptimized={process.env.NEXT_PUBLIC_IMAGE_UNOPTIMIZED === "1"}
    />
  );
}
