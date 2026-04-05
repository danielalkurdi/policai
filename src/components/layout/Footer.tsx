import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Policai</span>
          <span className="hidden sm:inline">&middot;</span>
          <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          <span className="hidden sm:inline">&middot;</span>
          <Link href="/methodology" className="hover:text-foreground transition-colors">Methodology</Link>
          <span className="hidden sm:inline">&middot;</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
