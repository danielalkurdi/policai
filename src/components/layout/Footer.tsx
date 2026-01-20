import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">P</span>
              </div>
              <span className="text-xl font-bold">Policai</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Tracking Australian AI policy and regulation developments.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/policies" className="text-muted-foreground hover:text-foreground">
                  All Policies
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-muted-foreground hover:text-foreground">
                  Geographic View
                </Link>
              </li>
              <li>
                <Link href="/timeline" className="text-muted-foreground hover:text-foreground">
                  Timeline
                </Link>
              </li>
              <li>
                <Link href="/network" className="text-muted-foreground hover:text-foreground">
                  Relationships
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/agencies" className="text-muted-foreground hover:text-foreground">
                  Agency Directory
                </Link>
              </li>
              <li>
                <a
                  href="https://www.industry.gov.au/publications/australias-artificial-intelligence-ethics-framework"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  AI Ethics Framework
                </a>
              </li>
              <li>
                <a
                  href="https://www.dta.gov.au"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Digital Transformation Agency
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">About</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Policai
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="text-muted-foreground hover:text-foreground">
                  Methodology
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            Policai is an independent project tracking Australian AI policy.
            Not affiliated with any government agency.
          </p>
          <p className="mt-2">
            Data last updated: {new Date().toLocaleDateString('en-AU')}
          </p>
        </div>
      </div>
    </footer>
  );
}
