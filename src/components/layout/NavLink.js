'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * A custom Link component that automatically adds an 'active' class
 * when the current route matches the href.
 * 
 * @param {Object} props - Standard Next.js Link props
 * @param {string} props.activeClassName - Custom class to add when active (default: 'active')
 * @param {boolean} props.exactMatch - If true, only matches exact path (default: false)
 */
export default function NavLink({ 
  href, 
  children, 
  activeClassName = 'active', 
  className = '', 
  exactMatch = false,
  ...props 
}) {
  const pathname = usePathname();
  
  // Normalize href for comparison (remove trailing slashes if any)
  const normalizedHref = href === '/' ? '/' : href.replace(/\/$/, '');
  const normalizedPathname = pathname === '/' ? '/' : pathname.replace(/\/$/, '');

  const isActive = exactMatch 
    ? normalizedPathname === normalizedHref
    : normalizedPathname === normalizedHref || (normalizedHref !== '/' && normalizedPathname.startsWith(normalizedHref));

  const combinedClassName = `${className} ${isActive ? activeClassName : ''}`.trim();

  return (
    <Link href={href} className={combinedClassName} {...props}>
      {children}
    </Link>
  );
}
