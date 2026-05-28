"use client";

import "@xyflow/react/dist/style.css";

import {
  Background,
  type Edge,
  type Node,
  type NodeProps,
  ReactFlow,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlowProvider,
} from "@xyflow/react";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Avatar } from "@/components/ui";
import { RELATION_META } from "@/lib/constants";
import { buildProfileUrl } from "@/lib/utils";

import type {
  Profile,
  Relation,
  RelationType,
} from "@/types/database";

type Layout = "family" | "org";

interface HierarchyFlowProps {
  rootProfile: Profile;
  relations: Relation[];
  profiles: Profile[];
  layout?: Layout;
  className?: string;
  minimap?: boolean;
}

type ProfileNodeData = {
  profile: Profile;
  isRoot: boolean;
  relationType?: RelationType;
};

function ProfileNode({ data }: NodeProps) {
  const { profile, isRoot, relationType } = data as unknown as ProfileNodeData;
  const meta = relationType ? RELATION_META[relationType] : null;

  return (
    <div
      className={`relative rounded-2xl border bg-surface shadow-soft px-3 py-2.5 min-w-44 max-w-56 hover:shadow-elevated transition ${
        isRoot ? "border-brand-500 ring-2 ring-brand-500/30" : "border-border"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <Link href={buildProfileUrl(profile.username)} className="flex items-center gap-2.5">
        <Avatar src={profile.avatar_url} name={profile.full_name} size={36} />
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate text-sm font-semibold text-ink">
            {profile.full_name}
            {profile.is_verified && (
              <CheckCircle2 className="h-3 w-3 text-brand-600 shrink-0" />
            )}
          </p>
          {profile.occupation && (
            <p className="truncate text-[11px] text-ink-muted">
              {profile.occupation}
            </p>
          )}
        </div>
      </Link>

      {meta && !isRoot && (
        <span
          className="absolute -top-2 left-3 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-soft"
          style={{ backgroundColor: meta.color }}
        >
          {meta.label}
        </span>
      )}

      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
}

const nodeTypes = { profile: ProfileNode };

export function HierarchyFlow({
  rootProfile,
  relations,
  profiles,
  layout = "family",
  className,
  minimap = true,
}: HierarchyFlowProps) {
  const { nodes, edges } = React.useMemo(
    () => buildGraph(rootProfile, relations, profiles, layout),
    [rootProfile, relations, profiles, layout],
  );

  return (
    <div
      className={`relative w-full rounded-2xl border border-border bg-surface-muted ${className ?? ""}`}
    >
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ animated: false }}
        >
          <Background gap={20} size={1} />
          <Controls position="bottom-right" showInteractive={false} />
          {minimap && (
            <MiniMap
              pannable
              zoomable
              maskColor="rgba(15,23,42,0.05)"
              nodeColor={(n) => ((n.data as ProfileNodeData).isRoot ? "#2563eb" : "#94a3b8")}
            />
          )}
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

function buildGraph(
  rootProfile: Profile,
  relations: Relation[],
  profiles: Profile[],
  layout: Layout,
) {
  const byId = new Map<string, Profile>();
  profiles.forEach((p) => byId.set(p.id, p));
  byId.set(rootProfile.id, rootProfile);

  // Group nodes by category for layout
  const groups: Record<"parents" | "siblings" | "children" | "peers" | "team", Relation[]> = {
    parents: [],
    siblings: [],
    children: [],
    peers: [],
    team: [],
  };

  relations.forEach((r) => {
    const otherId = r.user_id === rootProfile.id ? r.related_user_id : r.user_id;
    if (!byId.has(otherId)) return;
    const t = r.relation_type;
    if (layout === "family") {
      if (t === "parent") groups.parents.push(r);
      else if (t === "child") groups.children.push(r);
      else if (t === "sibling" || t === "cousin" || t === "spouse") groups.siblings.push(r);
      else groups.peers.push(r);
    } else {
      if (t === "manager") groups.parents.push(r);
      else if (t === "employee") groups.children.push(r);
      else if (t === "business_partner") groups.siblings.push(r);
      else groups.team.push(r);
    }
  });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Root in the center
  const rootX = 0;
  const rootY = 0;
  nodes.push({
    id: rootProfile.id,
    type: "profile",
    position: { x: rootX, y: rootY },
    data: { profile: rootProfile, isRoot: true } satisfies ProfileNodeData,
  });

  const NODE_W = 220;
  const NODE_H = 110;
  const GAP_X = 60;
  const GAP_Y = 140;

  const placeRow = (rels: Relation[], y: number) => {
    const total = rels.length;
    const rowWidth = total * NODE_W + (total - 1) * GAP_X;
    const startX = rootX + NODE_W / 2 - rowWidth / 2;
    rels.forEach((r, i) => {
      const otherId = r.user_id === rootProfile.id ? r.related_user_id : r.user_id;
      const profile = byId.get(otherId)!;
      const x = startX + i * (NODE_W + GAP_X);
      nodes.push({
        id: `${otherId}-${r.relation_type}-${y}`,
        type: "profile",
        position: { x, y },
        data: {
          profile,
          isRoot: false,
          relationType: r.relation_type,
        } satisfies ProfileNodeData,
      });
      edges.push({
        id: `e-${r.id}`,
        source: y < 0 ? `${otherId}-${r.relation_type}-${y}` : rootProfile.id,
        target: y < 0 ? rootProfile.id : `${otherId}-${r.relation_type}-${y}`,
        type: "smoothstep",
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, color: RELATION_META[r.relation_type].color },
        style: { stroke: RELATION_META[r.relation_type].color, strokeWidth: 1.5 },
        label: RELATION_META[r.relation_type].label,
        labelBgPadding: [6, 3],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: "#ffffff", stroke: "#e2e8f0" },
        labelStyle: { fontSize: 10, fontWeight: 600, fill: "#0f172a" },
      });
    });
  };

  placeRow(groups.parents, -GAP_Y - NODE_H);
  placeRow(groups.siblings, 0);
  placeRow(groups.children, GAP_Y + NODE_H);
  placeRow(groups.peers, GAP_Y * 2 + NODE_H * 2);
  if (layout === "org") placeRow(groups.team, GAP_Y * 2 + NODE_H * 2);

  // Move siblings to the side of root, not stacked over it
  if (groups.siblings.length > 0) {
    const sibStartX = rootX + NODE_W + GAP_X * 2;
    groups.siblings.forEach((r, i) => {
      const otherId = r.user_id === rootProfile.id ? r.related_user_id : r.user_id;
      const id = `${otherId}-${r.relation_type}-0`;
      const node = nodes.find((n) => n.id === id);
      if (node) node.position = { x: sibStartX + i * (NODE_W + GAP_X), y: rootY };
    });
  }

  return { nodes, edges };
}
