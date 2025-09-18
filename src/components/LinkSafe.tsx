import Link from 'next/link';
import { ComponentProps } from 'react';

type LinkSafeProps = ComponentProps<typeof Link> & {
  href: string | undefined | null;
};

/**
 * Safe wrapper around Next.js Link that guards against undefined/null href values
 * to prevent "Cannot read properties of undefined (reading 'call')" errors
 */
export default function LinkSafe({ href, children, ...props }: LinkSafeProps) {
  // Guard against undefined, null, or empty href values
  if (!href || href.trim() === '') {
    return null;
  }

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
