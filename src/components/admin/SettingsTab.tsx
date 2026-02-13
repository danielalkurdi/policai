import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function SettingsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Configuration</CardTitle>
          <CardDescription>
            Configure the Claude AI integration for content analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">Anthropic API Key</Label>
            <Input id="apiKey" type="password" placeholder="sk-ant-..." />
            <p className="text-xs text-muted-foreground">
              Your API key is stored securely in environment variables
            </p>
          </div>
          <Separator />
          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Select defaultValue="claude-sonnet-4-20250514">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-sonnet-4-20250514">Claude Sonnet 4</SelectItem>
                <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="relevanceThreshold">Relevance Threshold</Label>
            <Input
              id="relevanceThreshold"
              type="number"
              min="0"
              max="1"
              step="0.05"
              defaultValue="0.7"
            />
            <p className="text-xs text-muted-foreground">
              Minimum relevance score (0-1) for content to be flagged for review
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Settings</CardTitle>
          <CardDescription>Configure Supabase connection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="supabaseUrl">Supabase URL</Label>
            <Input id="supabaseUrl" placeholder="https://xxx.supabase.co" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="supabaseKey">Supabase Anon Key</Label>
            <Input id="supabaseKey" type="password" placeholder="eyJ..." />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Settings</Button>
      </div>
    </div>
  );
}
