"use client";

import React, { memo } from "react";
import { Badge } from "@/components/ui/badge";

interface BoardHeaderProps {
  title?: string;
  description?: string;
  sprintName?: string;
  teamName?: string;
}

export const BoardHeader = memo(function BoardHeader({
  title = "Sprint Retrospective Board",
  description = "Reflect on your team's performance and identify opportunities for continuous improvement",
  sprintName = "Sprint 24",
  teamName = "Development Team Alpha"
}: BoardHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <h1 className="mb-4 text-4xl font-bold text-balance">
        {title}
      </h1>
      <p className="text-muted-foreground mx-auto max-w-2xl text-lg text-pretty">
        {description}
      </p>
      <div className="mt-6 flex items-center justify-center gap-4">
        <Badge variant="secondary" className="px-3 py-1">
          {sprintName}
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          {teamName}
        </Badge>
      </div>
    </div>
  );
});