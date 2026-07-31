import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Network,
  Database,
  FileText,
  Tag,
  ArrowUpRight,
  Sparkles,
  Eye,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  Search,
  Layers,
  File,
  Mail,
  Image as ImageIcon,
  Cpu,
  Info
} from 'lucide-react';
import { DocumentItem } from '../types';

interface KnowledgeGraphModuleProps {
  documents: DocumentItem[];
  onSelectDoc: (docId: string) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'core' | 'category' | 'document' | 'tag';
  category?: string;
  fileType?: string;
  docRef?: DocumentItem;
  chunkCount?: number;
  val: number; // size
  color: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  relationship: string;
  value: number;
}

export const KnowledgeGraphModule: React.FC<KnowledgeGraphModuleProps> = ({
  documents,
  onSelectDoc,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(documents.map((d) => d.category)));
  }, [documents]);

  // Construct Graph Data (Nodes + Links)
  const { graphNodes, graphLinks } = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // 1. Core Vault Node
    const coreId = 'core-vault';
    nodes.push({
      id: coreId,
      label: 'AI Knowledge Vault',
      type: 'core',
      val: 28,
      color: '#3b82f6', // blue-500
    });

    // Color map for categories
    const categoryColors: Record<string, string> = {
      Office: '#6366f1', // indigo
      Student: '#ec4899', // pink
      Lawyer: '#f59e0b', // amber
      Doctor: '#10b981', // emerald
      Freelancer: '#8b5cf6', // purple
      Home: '#06b6d4', // cyan
      Personal: '#3b82f6', // blue
    };

    // 2. Category Cluster Hubs
    categories.forEach((cat) => {
      const catId = `cat-${cat}`;
      const color = categoryColors[cat] || '#8b5cf6';
      nodes.push({
        id: catId,
        label: `${cat} Hub`,
        type: 'category',
        category: cat,
        val: 20,
        color: color,
      });

      // Link Core -> Category
      links.push({
        source: coreId,
        target: catId,
        relationship: 'contains',
        value: 2,
      });
    });

    // 3. Document Nodes
    documents.forEach((doc) => {
      const docId = doc.id;
      let docColor = '#3b82f6';
      if (doc.fileType === 'pdf') docColor = '#ef4444'; // red
      else if (doc.fileType === 'email') docColor = '#f59e0b'; // amber
      else if (doc.fileType === 'note') docColor = '#10b981'; // emerald
      else if (doc.fileType === 'image') docColor = '#06b6d4'; // cyan

      nodes.push({
        id: docId,
        label: doc.title,
        type: 'document',
        category: doc.category,
        fileType: doc.fileType,
        docRef: doc,
        chunkCount: doc.chunkCount,
        val: 14 + Math.min(doc.chunkCount, 10),
        color: docColor,
      });

      // Link Document -> Category Hub
      const catId = `cat-${doc.category}`;
      links.push({
        source: catId,
        target: docId,
        relationship: 'belongs_to',
        value: 1.5,
      });

      // Add tag hubs & cross links
      doc.tags.forEach((tag) => {
        const tagId = `tag-${tag.toLowerCase()}`;
        let tagNode = nodes.find((n) => n.id === tagId);
        if (!tagNode) {
          tagNode = {
            id: tagId,
            label: `#${tag}`,
            type: 'tag',
            val: 10,
            color: '#64748b', // slate-500
          };
          nodes.push(tagNode);
        }

        links.push({
          source: docId,
          target: tagId,
          relationship: 'tagged',
          value: 1,
        });
      });
    });

    return { graphNodes: nodes, graphLinks: links };
  }, [documents, categories]);

  // Filter nodes & links based on Category and Search Query
  const { filteredNodes, filteredLinks } = useMemo(() => {
    let activeNodeIds = new Set<string>();

    graphNodes.forEach((node) => {
      let matchesCategory = activeCategory === 'all' || node.type === 'core' || node.category === activeCategory || node.id === `cat-${activeCategory}`;
      let matchesSearch = !searchQuery.trim() || node.label.toLowerCase().includes(searchQuery.toLowerCase()) || (node.docRef && node.docRef.rawText.toLowerCase().includes(searchQuery.toLowerCase()));

      if (matchesCategory && matchesSearch) {
        activeNodeIds.add(node.id);
      }
    });

    // Ensure links connect active nodes
    const finalLinks = graphLinks.filter((l) => {
      const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
      const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
      return activeNodeIds.has(srcId) && activeNodeIds.has(tgtId);
    });

    const finalNodes = graphNodes.filter((n) => activeNodeIds.has(n.id));

    return { filteredNodes: finalNodes, filteredLinks: finalLinks };
  }, [graphNodes, graphLinks, activeCategory, searchQuery]);

  // Set default selected node
  useEffect(() => {
    if (!selectedNode && filteredNodes.length > 0) {
      const firstDocNode = filteredNodes.find((n) => n.type === 'document') || filteredNodes[0];
      setSelectedNode(firstDocNode);
    }
  }, [filteredNodes]);

  // D3 Simulation Setup
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = window.innerWidth < 768 ? 360 : 520;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous rendering

    svg.attr('width', width).attr('height', height);

    // Create main container group for zooming
    const g = svg.append('g').attr('class', 'main-graph-group');

    // Zoom setup
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Clone nodes and links to prevent d3 mutation bugs across re-renders
    const nodesCopy: GraphNode[] = JSON.parse(JSON.stringify(filteredNodes));
    const linksCopy: GraphLink[] = filteredLinks.map((l) => ({
      source: typeof l.source === 'object' ? (l.source as GraphNode).id : l.source,
      target: typeof l.target === 'object' ? (l.target as GraphNode).id : l.target,
      relationship: l.relationship,
      value: l.value,
    }));

    // Create D3 Force Simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodesCopy)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(linksCopy)
          .id((d) => d.id)
          .distance(90)
      )
      .force('charge', d3.forceManyBody().strength(-240))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide<GraphNode>().radius((d) => d.val + 18));

    simulationRef.current = simulation;

    // Render Links
    const link = g
      .append('g')
      .attr('stroke-opacity', 0.4)
      .selectAll('line')
      .data(linksCopy)
      .join('line')
      .attr('stroke', '#475569') // slate-600
      .attr('stroke-width', (d) => Math.sqrt(d.value) * 1.8)
      .attr('stroke-dasharray', (d) => (d.relationship === 'tagged' ? '3 3' : 'none'));

    // Render Node Groups
    const node = g
      .append('g')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodesCopy)
      .join('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Glowing outer ring for core/category nodes
    node
      .append('circle')
      .attr('r', (d) => d.val + 5)
      .attr('fill', 'none')
      .attr('stroke', (d) => d.color)
      .attr('stroke-opacity', 0.25)
      .attr('stroke-width', 2);

    // Inner filled circle
    node
      .append('circle')
      .attr('r', (d) => d.val)
      .attr('fill', (d) => d.color)
      .attr('stroke', '#020617') // slate-950
      .attr('stroke-width', 2.5)
      .attr('shadow-lg', 'true');

    // Node Labels
    node
      .append('text')
      .text((d) => (d.label.length > 18 ? `${d.label.substring(0, 16)}...` : d.label))
      .attr('x', 0)
      .attr('y', (d) => d.val + 16)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f8fafc') // slate-50
      .attr('font-size', (d) => (d.type === 'core' ? '12px' : d.type === 'category' ? '11px' : '10px'))
      .attr('font-weight', (d) => (d.type === 'core' || d.type === 'category' ? '700' : '500'))
      .style('pointer-events', 'none')
      .style('text-shadow', '0 2px 4px rgba(0,0,0,0.8)');

    // Node Click & Hover Interactions
    node.on('click', (event, d) => {
      const originalNode = graphNodes.find((n) => n.id === d.id) || d;
      setSelectedNode(originalNode);
    });

    node.on('mouseenter', (event, d) => {
      setHoveredNodeId(d.id);

      // Highlight connected lines
      link
        .attr('stroke', (l) => {
          const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
          const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
          return srcId === d.id || tgtId === d.id ? '#60a5fa' : '#334155';
        })
        .attr('stroke-opacity', (l) => {
          const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
          const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
          return srcId === d.id || tgtId === d.id ? 0.9 : 0.15;
        })
        .attr('stroke-width', (l) => {
          const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
          const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
          return srcId === d.id || tgtId === d.id ? 2.5 : 1;
        });
    });

    node.on('mouseleave', () => {
      setHoveredNodeId(null);
      link
        .attr('stroke', '#475569')
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', (d) => Math.sqrt(d.value) * 1.8);
    });

    // Simulation Ticks
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphNode).x!)
        .attr('y1', (d) => (d.source as GraphNode).y!)
        .attr('x2', (d) => (d.target as GraphNode).x!)
        .attr('y2', (d) => (d.target as GraphNode).y!);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredNodes, filteredLinks]);

  // Controls Handlers
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  const toggleSimulation = () => {
    if (!simulationRef.current) return;
    if (isSimulating) {
      simulationRef.current.stop();
      setIsSimulating(false);
    } else {
      simulationRef.current.alpha(0.3).restart();
      setIsSimulating(true);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
      {/* Module Title & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-slate-800/80 pb-4 sm:pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Network className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 shrink-0" />
            Visual Knowledge Map
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Interactive map connecting all your saved documents, topic categories, and semantic tags.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Active Nodes: <strong className="text-white">{filteredNodes.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 lg:gap-4 shadow-lg">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none touch-pan-x flex-nowrap w-full py-1">
          <span className="text-[11px] sm:text-xs text-slate-400 font-semibold flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Category:</span>
          </span>
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Clusters ({documents.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Node Input */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search graph nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        
        {/* Left Interactive D3 Canvas (8 Cols) */}
        <div
          ref={containerRef}
          className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl relative h-[340px] sm:h-[460px] lg:h-[540px] overflow-hidden shadow-2xl flex flex-col justify-between group"
        >
          {/* Canvas Floating Top Controls */}
          <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-20 flex items-center justify-between pointer-events-none gap-2">
            <div className="flex items-center gap-2 pointer-events-auto shrink-0">
              <span className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-[9px] sm:text-[10px] font-mono flex items-center gap-1.5 backdrop-blur-md">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span>D3 Physics Active</span>
              </span>
            </div>

            {/* Camera Controls */}
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-xl backdrop-blur-md pointer-events-auto shrink-0">
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Reset Camera View"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <div className="w-px h-4 bg-slate-800 my-auto mx-0.5" />
              <button
                onClick={toggleSimulation}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isSimulating ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'hover:bg-slate-800 text-slate-400'
                }`}
                title={isSimulating ? 'Pause Physics' : 'Resume Physics'}
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
            </div>
          </div>

          {/* SVG D3 Container */}
          <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Canvas Bottom Legend */}
          <div className="p-2.5 sm:p-3 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] sm:text-[11px] text-slate-400 gap-1.5 sm:gap-2 backdrop-blur-md z-10">
            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none touch-pan-x flex-nowrap py-0.5 w-full sm:w-auto">
              <span className="flex items-center gap-1.5 shrink-0 whitespace-nowrap"><span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-500 shrink-0" /> Vault Core</span>
              <span className="flex items-center gap-1.5 shrink-0 whitespace-nowrap"><span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-indigo-500 shrink-0" /> Category Hub</span>
              <span className="flex items-center gap-1.5 shrink-0 whitespace-nowrap"><span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 shrink-0" /> PDF Document</span>
              <span className="flex items-center gap-1.5 shrink-0 whitespace-nowrap"><span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500 shrink-0" /> Email</span>
              <span className="flex items-center gap-1.5 shrink-0 whitespace-nowrap"><span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-slate-500 shrink-0" /> Tag</span>
            </div>
            <span className="font-mono text-[9px] sm:text-[10px] text-slate-500 shrink-0 truncate">Drag nodes • Scroll to zoom</span>
          </div>
        </div>

        {/* Right Node Inspector Card (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold border"
                  style={{
                    backgroundColor: `${selectedNode.color}15`,
                    borderColor: `${selectedNode.color}40`,
                    color: selectedNode.color,
                  }}
                >
                  {selectedNode.type.toUpperCase()} NODE
                </span>
                {selectedNode.chunkCount && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {selectedNode.chunkCount} vector chunks
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-white leading-snug">{selectedNode.label}</h3>
                {selectedNode.docRef && (
                  <p className="text-xs text-slate-400 font-mono mt-1">{selectedNode.docRef.filename}</p>
                )}
              </div>

              {selectedNode.docRef ? (
                <>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">AI Grounded Summary:</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.docRef.summary}</p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Connected Semantic Tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.docRef.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-mono">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectDoc(selectedNode.docRef!.id)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 mt-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect In Document Library</span>
                  </button>
                </>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2 text-slate-200 font-semibold">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span>Cluster Aggregator</span>
                  </div>
                  <p>
                    This node aggregates all connected documents and notes grouped under category <strong className="text-white">{selectedNode.label}</strong>.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs space-y-2">
              <Sparkles className="w-6 h-6 text-slate-600" />
              <p>Click any graph node on the D3 canvas to inspect its semantic metadata & vector grounding.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
