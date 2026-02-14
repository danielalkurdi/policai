'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Map, FileText, Building2, Menu, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/policies', label: 'Policies', icon: FileText },
  { href: '/map', label: 'Map', icon: Map },
  { href: '/agencies', label: 'Agencies', icon: Building2 },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold">P</span>
          </div>
          <span className="text-xl font-bold">Policai</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-8 hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center space-x-2">
          <ThemeToggle />
          {!isLoading && (
            <>
              {user ? (
                <>
                  <Button variant="outline" size="sm" asChild className="hidden md:flex">
                    <Link href="/admin">Admin</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="hidden md:flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" asChild className="hidden md:flex">
                  <Link href="/admin/login">
                    <User className="h-4 w-4 mr-2" />
                    Admin Login
                  </Link>
                </Button>
              )}
            </>
          )}

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="flex flex-col space-y-2 mt-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
                {user ? (
                  <>
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <User className="h-5 w-5" />
                      Admin
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground w-full text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/admin/login"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <User className="h-5 w-5" />
                    Admin Login
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
