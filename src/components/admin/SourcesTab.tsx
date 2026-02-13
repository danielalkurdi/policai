import {
  Plus,
  RefreshCw,
  Settings,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DataSource {
  id: string;
  name: string;
  url: string;
  type: string;
  schedule: string;
  lastRun: string;
  status: string;
  itemsFound: number;
  enabled: boolean;
}

interface SourcesTabProps {
  sources: DataSource[];
  isRunningSource: string | null;
  onRunScraper: (sourceId: string, sourceName: string) => void;
  onToggleSource: (sourceId: string) => void;
}

function getScheduleBadgeVariant(schedule: string): "default" | "secondary" | "outline" {
  switch (schedule) {
    case 'daily': return 'default';
    case 'weekly': return 'secondary';
    case 'monthly': return 'outline';
    default: return 'outline';
  }
}

export function SourcesTab({
  sources,
  isRunningSource,
  onRunScraper,
  onToggleSource,
}: SourcesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Data Sources</h2>
          <p className="text-sm text-muted-foreground">
            Configure and monitor automatic content discovery sources
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{sources.length}</div>
              <p className="text-sm text-muted-foreground">Total Sources</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {sources.filter(s => s.enabled).length}
              </div>
              <p className="text-sm text-muted-foreground">Enabled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {sources.reduce((sum, s) => sum + s.itemsFound, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Items Found</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {sources.filter(s => s.schedule === 'daily').length}
              </div>
              <p className="text-sm text-muted-foreground">Daily Scrapers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {sources.map((source) => (
          <Card key={source.id} className={!source.enabled ? 'opacity-60' : ''}>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        source.enabled && source.status === 'healthy'
                          ? 'bg-green-500'
                          : source.enabled
                          ? 'bg-red-500'
                          : 'bg-gray-400'
                      }`}
                    />
                    <input
                      type="checkbox"
                      checked={source.enabled}
                      onChange={() => onToggleSource(source.id)}
                      className="h-4 w-4 rounded"
                      title={source.enabled ? 'Disable source' : 'Enable source'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold">{source.name}</h3>
                      <Badge variant={getScheduleBadgeVariant(source.schedule)}>
                        {source.schedule}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {source.type}
                      </Badge>
                    </div>
                    <a
                      href={source.url}
                      className="text-sm text-primary hover:underline block truncate"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.url}
                    </a>
                    <div className="mt-2 flex items-center gap-2 sm:gap-4 text-sm text-muted-foreground flex-wrap">
                      {source.status === 'healthy' ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Healthy</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span>Error</span>
                        </div>
                      )}
                      <span className="hidden sm:inline">&bull;</span>
                      <span>Last run: {new Date(source.lastRun).toLocaleString('en-AU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="hidden sm:inline">&bull;</span>
                      <span className="font-medium">{source.itemsFound} items</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-7 sm:ml-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRunScraper(source.id, source.name)}
                    disabled={!source.enabled || isRunningSource === source.id}
                  >
                    {isRunningSource === source.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Run Now
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
