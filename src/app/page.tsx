import Link from 'next/link';
import { Map, Clock, Network, FileText, Building2, ArrowRight, TrendingUp, LayoutGrid, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { HomeSearch } from '@/components/home-search';

// Import sample data for stats
import policiesData from '@/../public/data/sample-policies.json';
import agenciesData from '@/../public/data/sample-agencies.json';
import timelineData from '@/../public/data/sample-timeline.json';

const features = [
  {
    icon: LayoutGrid,
    title: 'Policy Framework',
    description: 'Interactive visual map of the DTA AI Policy with requirements and timelines.',
    href: '/framework',
    featured: true,
  },
  {
    icon: Map,
    title: 'Geographic View',
    description: 'Explore policies by state and territory on an interactive map of Australia.',
    href: '/map',
  },
  {
    icon: Clock,
    title: 'Timeline',
    description: 'Track the evolution of AI policy through time with key milestones and events.',
    href: '/timeline',
  },
  {
    icon: Network,
    title: 'Relationship Graph',
    description: 'Visualise connections between policies, agencies, and jurisdictions.',
    href: '/network',
  },
  {
    icon: Building2,
    title: 'Agency Directory',
    description: 'Browse government agencies and their AI transparency statements.',
    href: '/agencies',
  },
];

// Calculate stats from sample data
const stats = {
  policies: policiesData.length,
  agencies: agenciesData.length,
  jurisdictions: new Set(policiesData.map((p) => p.jurisdiction)).size,
  activePolicies: policiesData.filter((p) => p.status === 'active').length,
};

// Get recent timeline events
const recentEvents = timelineData
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 5);

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
            <Badge variant="secondary" className="mb-4">
              Tracking Australian AI Policy
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Navigate Australia&apos;s{' '}
              <span className="text-primary">AI Policy Landscape</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Policai aggregates and visualises AI policy, regulation, and governance
              developments across federal and state jurisdictions. Stay informed about
              the rules shaping AI in Australia.
            </p>

            {/* Search Bar */}
            <div className="mt-8 mx-auto max-w-2xl">
              <HomeSearch />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="group">
                <Link href="/policies">
                  <FileText className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Browse Policies
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="group">
                <Link href="/map">
                  <Map className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Explore Map
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30 py-12 animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="flex items-center justify-center mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-primary">{stats.policies}</div>
              <div className="text-sm text-muted-foreground mt-1">Policies Tracked</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="flex items-center justify-center mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-primary">{stats.agencies}</div>
              <div className="text-sm text-muted-foreground mt-1">Agencies</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="flex items-center justify-center mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-primary">{stats.jurisdictions}</div>
              <div className="text-sm text-muted-foreground mt-1">Jurisdictions</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="flex items-center justify-center mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-primary">{stats.activePolicies}</div>
              <div className="text-sm text-muted-foreground mt-1">Active Policies</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Multiple Ways to Explore</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Policai provides multiple visualization tools to help you understand
              Australia&apos;s AI policy landscape from different perspectives.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.href} className="group hover:shadow-xl hover:scale-105 hover:border-primary/50 transition-all duration-300">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all">
                      <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={feature.href}
                      className="inline-flex items-center text-sm text-primary hover:underline group-hover:translate-x-1 transition-transform"
                    >
                      Explore
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Updates Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Recent Developments</h2>
              <p className="mt-2 text-muted-foreground">
                Latest AI policy events and milestones
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/timeline">
                View Timeline
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {recentEvents.map((event) => (
              <Card key={event.id} className="group hover:shadow-lg hover:border-primary/30 transition-all">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{event.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {event.jurisdiction.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs ml-auto">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(event.date).toLocaleDateString('en-AU', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
            <CardContent className="p-8 md:p-12 text-center relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold">
                Stay Informed on AI Policy
              </h2>
              <p className="mt-4 text-primary-foreground/90 max-w-2xl mx-auto">
                Subscribe to receive updates on new policies, regulatory changes, and key developments in Australian AI governance.
              </p>
              <div className="mt-8 max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:bg-primary-foreground/20"
                  />
                  <Button size="lg" variant="secondary" className="whitespace-nowrap">
                    Subscribe
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                <p className="mt-3 text-xs text-primary-foreground/70">
                  No spam. Unsubscribe anytime. We respect your privacy.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Weekly updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Policy alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Expert insights</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
