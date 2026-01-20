'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, FileText, Building2, ArrowRight, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  JURISDICTION_NAMES,
  POLICY_TYPE_NAMES,
  type Jurisdiction,
  type PolicyType,
} from '@/types';

interface Policy {
  id: string;
  title: string;
  description: string;
  jurisdiction: string;
  type: string;
  status: string;
  tags: string[];
}

interface Agency {
  id: string;
  name: string;
  acronym: string;
  jurisdiction: string;
}

interface SearchResult {
  type: 'policy' | 'agency';
  id: string;
  title: string;
  subtitle: string;
  jurisdiction: string;
  href: string;
  policyType?: string;
}

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [policiesRes, agenciesRes] = await Promise.all([
          fetch('/api/policies'),
          fetch('/data/sample-agencies.json'),
        ]);

        const policiesData = await policiesRes.json();
        const agenciesData = await agenciesRes.json();

        if (policiesData.success) {
          setPolicies(policiesData.data);
        }
        setAgencies(agenciesData);
      } catch (error) {
        console.error('Failed to load search data:', error);
      }
    };

    loadData();
  }, []);

  // Search function
  const search = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const queryLower = searchQuery.toLowerCase();

    // Search policies
    const policyResults: SearchResult[] = policies
      .filter((p) => p.status !== 'trashed')
      .filter(
        (p) =>
          p.title.toLowerCase().includes(queryLower) ||
          p.description.toLowerCase().includes(queryLower) ||
          p.tags.some((tag) => tag.toLowerCase().includes(queryLower)) ||
          p.jurisdiction.toLowerCase().includes(queryLower) ||
          p.type.toLowerCase().includes(queryLower)
      )
      .slice(0, 5)
      .map((p) => ({
        type: 'policy' as const,
        id: p.id,
        title: p.title,
        subtitle: p.description.slice(0, 100) + (p.description.length > 100 ? '...' : ''),
        jurisdiction: p.jurisdiction,
        policyType: p.type,
        href: `/policies/${p.id}`,
      }));

    // Search agencies
    const agencyResults: SearchResult[] = agencies
      .filter(
        (a) =>
          a.name.toLowerCase().includes(queryLower) ||
          a.acronym.toLowerCase().includes(queryLower)
      )
      .slice(0, 3)
      .map((a) => ({
        type: 'agency' as const,
        id: a.id,
        title: a.name,
        subtitle: a.acronym,
        jurisdiction: a.jurisdiction,
        href: `/agencies`,
      }));

    setResults([...policyResults, ...agencyResults]);
    setIsLoading(false);
    setSelectedIndex(-1);
  }, [policies, agencies]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, search]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && query) {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          router.push(results[selectedIndex].href);
          setIsOpen(false);
          setQuery('');
        } else if (query.trim()) {
          router.push(`/policies?search=${encodeURIComponent(query)}`);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/policies?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search policies, agencies, or keywords..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => query && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="pl-12 pr-12 py-6 text-lg bg-background/50 backdrop-blur border-2 focus:border-primary transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown Results */}
      {isOpen && query && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-background border-2 rounded-lg shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-2">
                {results.map((result, index) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={result.href}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      selectedIndex === index
                        ? 'bg-primary/10'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      result.type === 'policy' ? 'bg-primary/10' : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      {result.type === 'policy' ? (
                        <FileText className="h-5 w-5 text-primary" />
                      ) : (
                        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">
                          {result.title}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {JURISDICTION_NAMES[result.jurisdiction as Jurisdiction] || result.jurisdiction}
                        </Badge>
                        {result.policyType && (
                          <Badge variant="outline" className="text-xs">
                            {POLICY_TYPE_NAMES[result.policyType as PolicyType] || result.policyType}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {result.subtitle}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => {
                    router.push(`/policies?search=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                  }}
                >
                  <span className="text-sm">
                    View all results for &ldquo;{query}&rdquo;
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-sm">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => {
                  router.push(`/policies?search=${encodeURIComponent(query)}`);
                  setIsOpen(false);
                }}
              >
                Search all policies
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      <p className="mt-3 text-sm text-muted-foreground text-center">
        Try searching for &ldquo;transparency&rdquo;, &ldquo;DTA&rdquo;, or &ldquo;AI safety&rdquo;
      </p>
    </div>
  );
}
