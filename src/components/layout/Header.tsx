
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, LayoutDashboard, Leaf, Users, ShoppingCart as ShoppingCartLucideIcon, ClipboardList, CalendarCheck, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ShoppingCartIcon from '@/components/shop/ShoppingCartIcon';
import ShoppingCart from '@/components/shop/ShoppingCart';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/chatbot', label: 'Chatbot', icon: Bot },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/treatment-plan', label: 'Treatment Plan', icon: ClipboardList },
  { href: '/schedule', label: 'Schedule', icon: CalendarCheck },
  { href: '/practitioners', label: 'Practitioners', icon: Users },
  { href: '/shop', label: 'Shop', icon: ShoppingCartLucideIcon },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <header className="bg-card shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/chatbot" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <Leaf size={28} />
            <h1 className="text-2xl font-bold">AyurAid</h1>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
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
                <Link href={item.href} className="flex items-center gap-2 px-2 py-2 sm:px-3 rounded-md">
                  <item.icon size={20} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              </Button>
            ))}
            <ShoppingCartIcon />
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="flex items-center gap-2 px-2 py-2 sm:px-3 rounded-md text-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </nav>
        </div>
      </header>
      <ShoppingCart /> 
    </>
  );
}
