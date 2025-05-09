
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, LayoutDashboard, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/chatbot', label: 'Chatbot', icon: Bot },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/chatbot" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <Leaf size={28} />
          <h1 className="text-2xl font-bold">AyurAid</h1>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? 'default' : 'ghost'}
              asChild
              className={cn(
                "transition-all duration-200 ease-in-out",
                pathname === item.href 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Link href={item.href} className="flex items-center gap-2 px-3 py-2 rounded-md">
                <item.icon size={20} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
