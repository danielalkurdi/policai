'use client';

import { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Filter, FileText, Building2, Map, ExternalLink, Info } from 'lucide-react';
import {
  JURISDICTION_NAMES,
  POLICY_TYPE_NAMES,
  POLICY_STATUS_NAMES,
  type Jurisdiction,
  type PolicyType,
  type PolicyStatus,
} from '@/types';

import policiesData from '@/../public/data/sample-policies.json';
import agenciesData from '@/../public/data/sample-agencies.json';

type NodeType = 'policy' | 'agency' | 'jurisdiction';

interface NodeData {
  label: string;
  type: NodeType;
  originalData: typeof policiesData[0] | typeof agenciesData[0] | { jurisdiction: Jurisdiction };
}

// Generate nodes and edges from data
function generateGraphData(filterJurisdiction: string) {
  const nodes: Node<NodeData>[] = [];
  const edges: Edge[] = [];
  const positions: Record<string, { x: number; y: number }> = {};

  // Filter data by jurisdiction if specified
  const filteredPolicies =
    filterJurisdiction === 'all'
      ? policiesData
      : policiesData.filter((p) => p.jurisdiction === filterJurisdiction);

  const filteredAgencies =
    filterJurisdiction === 'all'
      ? agenciesData
      : agenciesData.filter((a) => a.jurisdiction === filterJurisdiction);

  const relevantJurisdictions =
    filterJurisdiction === 'all'
      ? [...new Set([...filteredPolicies.map((p) => p.jurisdiction)])]
      : [filterJurisdiction];

  // Position jurisdiction nodes on the left
  relevantJurisdictions.forEach((jurisdiction, index) => {
    const yPos = 100 + index * 200;
    positions[`jurisdiction-${jurisdiction}`] = { x: 50, y: yPos };
    nodes.push({
      id: `jurisdiction-${jurisdiction}`,
      type: 'default',
      position: { x: 50, y: yPos },
      data: {
        label: JURISDICTION_NAMES[jurisdiction as Jurisdiction] || jurisdiction,
        type: 'jurisdiction',
        originalData: { jurisdiction: jurisdiction as Jurisdiction },
      },
      style: {
        background: '#818cf8',
        color: 'white',
        border: '2px solid #6366f1',
        borderRadius: '8px',
        padding: '10px 20px',
        fontWeight: 'bold',
        width: 150,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });
  });

  // Position agency nodes in the middle
  filteredAgencies.forEach((agency, index) => {
    const yPos = 50 + index * 100;
    positions[`agency-${agency.id}`] = { x: 350, y: yPos };
    nodes.push({
      id: `agency-${agency.id}`,
      type: 'default',
      position: { x: 350, y: yPos },
      data: {
        label: agency.acronym || agency.name.substring(0, 20),
        type: 'agency',
        originalData: agency,
      },
      style: {
        background: '#fbbf24',
        color: '#1f2937',
        border: '2px solid #f59e0b',
        borderRadius: '8px',
        padding: '8px 16px',
        width: 120,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });

    // Connect agency to jurisdiction
    edges.push({
      id: `edge-${agency.id}-${agency.jurisdiction}`,
      source: `jurisdiction-${agency.jurisdiction}`,
      target: `agency-${agency.id}`,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#94a3b8', strokeWidth: 1 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    });
  });

  // Position policy nodes on the right
  filteredPolicies.forEach((policy, index) => {
    const yPos = 30 + index * 90;
    positions[`policy-${policy.id}`] = { x: 650, y: yPos };
    nodes.push({
      id: `policy-${policy.id}`,
      type: 'default',
      position: { x: 650, y: yPos },
      data: {
        label: policy.title.length > 30 ? policy.title.substring(0, 30) + '...' : policy.title,
        type: 'policy',
        originalData: policy,
      },
      style: {
        background: policy.status === 'active' ? '#22c55e' : policy.status === 'proposed' ? '#eab308' : '#6b7280',
        color: 'white',
        border: '2px solid',
        borderColor: policy.status === 'active' ? '#16a34a' : policy.status === 'proposed' ? '#ca8a04' : '#4b5563',
        borderRadius: '8px',
        padding: '8px 16px',
        width: 200,
        fontSize: '12px',
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });

    // Connect policy to its agencies
    policy.agencies.forEach((agencyId) => {
      const agency = filteredAgencies.find((a) => a.id === agencyId);
      if (agency) {
        edges.push({
          id: `edge-policy-${policy.id}-${agencyId}`,
          source: `agency-${agencyId}`,
          target: `policy-${policy.id}`,
          type: 'smoothstep',
          animated: policy.status === 'active',
          style: { stroke: '#22c55e', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
          label: 'governs',
          labelStyle: { fontSize: 10, fill: '#6b7280' },
        });
      }
    });
  });

  return { nodes, edges };
}

export default function NetworkPage() {
  const [filterJurisdiction, setFilterJurisdiction] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => generateGraphData(filterJurisdiction),
    [filterJurisdiction]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<NodeData>) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Relationship Network</h1>
        <p className="mt-2 text-muted-foreground">
          Visualize connections between policies, agencies, and jurisdictions
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters & Legend */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Jurisdiction</label>
                <Select value={filterJurisdiction} onValueChange={setFilterJurisdiction}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Jurisdictions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jurisdictions</SelectItem>
                    {Object.entries(JURISDICTION_NAMES).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filterJurisdiction !== 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterJurisdiction('all')}
                >
                  Clear Filter
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-4 w-4" />
                Legend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 rounded bg-indigo-400 border-2 border-indigo-500" />
                <span className="text-sm">Jurisdiction</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 rounded bg-amber-400 border-2 border-amber-500" />
                <span className="text-sm">Agency</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 rounded bg-green-500 border-2 border-green-600" />
                <span className="text-sm">Active Policy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 rounded bg-yellow-500 border-2 border-yellow-600" />
                <span className="text-sm">Proposed Policy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 rounded bg-gray-500 border-2 border-gray-600" />
                <span className="text-sm">Other Status</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Use</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Click and drag to pan the view</p>
              <p>• Use scroll wheel to zoom</p>
              <p>• Click on any node to see details</p>
              <p>• Drag nodes to rearrange</p>
              <p>• Animated edges show active relationships</p>
            </CardContent>
          </Card>
        </div>

        {/* Network Graph */}
        <div className="lg:col-span-3">
          <Card className="h-[700px]">
            <CardContent className="p-0 h-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                fitView
                attributionPosition="bottom-left"
              >
                <Controls />
                <Background />
              </ReactFlow>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Node Detail Dialog */}
      <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <DialogContent className="max-w-lg">
          {selectedNode?.data.type === 'policy' && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <DialogTitle>Policy Details</DialogTitle>
                </div>
                <DialogDescription>
                  {(selectedNode.data.originalData as typeof policiesData[0]).title}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {POLICY_STATUS_NAMES[(selectedNode.data.originalData as typeof policiesData[0]).status as PolicyStatus]}
                    </Badge>
                    <Badge variant="secondary">
                      {POLICY_TYPE_NAMES[(selectedNode.data.originalData as typeof policiesData[0]).type as PolicyType]}
                    </Badge>
                    <Badge>
                      {JURISDICTION_NAMES[(selectedNode.data.originalData as typeof policiesData[0]).jurisdiction as Jurisdiction]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(selectedNode.data.originalData as typeof policiesData[0]).description}
                  </p>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">AI Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {(selectedNode.data.originalData as typeof policiesData[0]).aiSummary}
                    </p>
                  </div>
                  {(selectedNode.data.originalData as typeof policiesData[0]).sourceUrl && (
                    <a
                      href={(selectedNode.data.originalData as typeof policiesData[0]).sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Source
                    </a>
                  )}
                </div>
              </ScrollArea>
            </>
          )}

          {selectedNode?.data.type === 'agency' && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <DialogTitle>Agency Details</DialogTitle>
                </div>
                <DialogDescription>
                  {(selectedNode.data.originalData as typeof agenciesData[0]).name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {(selectedNode.data.originalData as typeof agenciesData[0]).acronym}
                  </Badge>
                  <Badge variant="secondary">
                    {(selectedNode.data.originalData as typeof agenciesData[0]).level}
                  </Badge>
                  <Badge>
                    {JURISDICTION_NAMES[(selectedNode.data.originalData as typeof agenciesData[0]).jurisdiction as Jurisdiction]}
                  </Badge>
                </div>
                {(selectedNode.data.originalData as typeof agenciesData[0]).aiTransparencyStatement && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">AI Transparency Statement</h4>
                    <p className="text-sm text-muted-foreground">
                      {(selectedNode.data.originalData as typeof agenciesData[0]).aiTransparencyStatement}
                    </p>
                  </div>
                )}
                <a
                  href={(selectedNode.data.originalData as typeof agenciesData[0]).website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit Website
                </a>
              </div>
            </>
          )}

          {selectedNode?.data.type === 'jurisdiction' && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-primary" />
                  <DialogTitle>Jurisdiction</DialogTitle>
                </div>
                <DialogDescription>
                  {JURISDICTION_NAMES[(selectedNode.data.originalData as { jurisdiction: Jurisdiction }).jurisdiction]}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {policiesData.filter(
                          (p) => p.jurisdiction === (selectedNode.data.originalData as { jurisdiction: Jurisdiction }).jurisdiction
                        ).length}
                      </div>
                      <p className="text-sm text-muted-foreground">Policies</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {agenciesData.filter(
                          (a) => a.jurisdiction === (selectedNode.data.originalData as { jurisdiction: Jurisdiction }).jurisdiction
                        ).length}
                      </div>
                      <p className="text-sm text-muted-foreground">Agencies</p>
                    </CardContent>
                  </Card>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterJurisdiction((selectedNode.data.originalData as { jurisdiction: Jurisdiction }).jurisdiction);
                    setSelectedNode(null);
                  }}
                >
                  Filter by this Jurisdiction
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
