"use client";

import * as React from "react";

import { HierarchyFlow } from "@/components/relations/hierarchy-flow";
import { EmptyState, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { RELATION_META } from "@/lib/constants";

import type {
  Profile,
  Relation,
  RelationWithProfile,
} from "@/types/database";

interface Props {
  rootProfile: Profile;
  relations: RelationWithProfile[];
}

export function ProfileRelations({ rootProfile, relations }: Props) {
  const flatRelations: Relation[] = relations.map(({ related_profile: _r, ...rest }) => rest);
  const profiles = relations.map((r) => r.related_profile);

  if (relations.length === 0) {
    return (
      <EmptyState
        title="No relations yet"
        description="This person hasn't added any relationships."
      />
    );
  }

  return (
    <Tabs defaultValue="family">
      <TabsList>
        <TabsTrigger value="family">Family tree</TabsTrigger>
        <TabsTrigger value="org">Org chart</TabsTrigger>
      </TabsList>

      <TabsContent value="family">
        <HierarchyFlow
          rootProfile={rootProfile}
          relations={flatRelations}
          profiles={profiles}
          layout="family"
          minimap={false}
          className="h-[420px]"
        />
        <Legend />
      </TabsContent>

      <TabsContent value="org">
        <HierarchyFlow
          rootProfile={rootProfile}
          relations={flatRelations}
          profiles={profiles}
          layout="org"
          minimap={false}
          className="h-[420px]"
        />
        <Legend />
      </TabsContent>
    </Tabs>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {Object.entries(RELATION_META).map(([key, meta]) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-ink-muted"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: meta.color }}
          />
          {meta.label}
        </span>
      ))}
    </div>
  );
}
