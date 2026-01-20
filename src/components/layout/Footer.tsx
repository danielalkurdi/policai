import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

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

        {/* Credits Section */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col items-center gap-2 mb-6">
            <p className="text-sm text-muted-foreground">Created by</p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/danielalkurdi/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    Daniel Alkurdi
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Sparke Helmore Lawyers
                  </span>
                </div>
                <Linkedin className="h-4 w-4 text-muted-foreground group-hover:text-[#0A66C2] transition-colors" />
              </a>
              <a
                href="mailto:Daniel.Alkurdi@sparke.com.au"
                className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                aria-label="Email Daniel Alkurdi"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground text-center md:text-left">
              <p>
                © {new Date().getFullYear()} Policai. All rights reserved.
              </p>
              <p className="mt-1">
                Independent project tracking Australian AI policy. Not affiliated with any government agency.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com/policai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/policai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/company/policai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@policai.com.au"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            <span>Data last updated: {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="mx-2">•</span>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <span className="mx-2">•</span>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
