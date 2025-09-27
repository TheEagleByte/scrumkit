
export interface BoardColumn {
  column_type: string;
  title: string;
  description: string;
  color: string;
  icon?: string;
  display_order: number;
}

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  columns: BoardColumn[];
}

export const boardTemplates: BoardTemplate[] = [
  {
    id: "default",
    name: "Default (What Went Well)",
    description: "Classic retrospective format focusing on successes, improvements, and blockers",
    columns: [
      {
        column_type: "went-well",
        title: "What went well?",
        description: "Celebrate successes and positive outcomes",
        color: "bg-green-500/10 border-green-500/20",
        icon: "ThumbsUp",
        display_order: 0,
      },
      {
        column_type: "improve",
        title: "What could be improved?",
        description: "Identify areas for enhancement",
        color: "bg-yellow-500/10 border-yellow-500/20",
        icon: "Lightbulb",
        display_order: 1,
      },
      {
        column_type: "blockers",
        title: "What blocked us?",
        description: "Obstacles and impediments faced",
        color: "bg-red-500/10 border-red-500/20",
        icon: "AlertTriangle",
        display_order: 2,
      },
      {
        column_type: "action-items",
        title: "Action items",
        description: "Next steps and commitments",
        color: "bg-blue-500/10 border-blue-500/20",
        icon: "Target",
        display_order: 3,
      },
    ],
  },
  {
    id: "mad-sad-glad",
    name: "Mad, Sad, Glad",
    description: "Focus on emotional responses to sprint events",
    columns: [
      {
        column_type: "mad",
        title: "Mad",
        description: "Things that frustrated or angered the team",
        color: "bg-red-500/10 border-red-500/20",
        icon: "Frown",
        display_order: 0,
      },
      {
        column_type: "sad",
        title: "Sad",
        description: "Disappointing or unfortunate events",
        color: "bg-yellow-500/10 border-yellow-500/20",
        icon: "Meh",
        display_order: 1,
      },
      {
        column_type: "glad",
        title: "Glad",
        description: "Positive experiences and achievements",
        color: "bg-green-500/10 border-green-500/20",
        icon: "Smile",
        display_order: 2,
      },
    ],
  },
  {
    id: "start-stop-continue",
    name: "Start, Stop, Continue",
    description: "Focus on actionable changes for the team",
    columns: [
      {
        column_type: "start",
        title: "Start",
        description: "New practices to adopt",
        color: "bg-green-500/10 border-green-500/20",
        icon: "PlayCircle",
        display_order: 0,
      },
      {
        column_type: "stop",
        title: "Stop",
        description: "Practices to discontinue",
        color: "bg-red-500/10 border-red-500/20",
        icon: "PauseCircle",
        display_order: 1,
      },
      {
        column_type: "continue",
        title: "Continue",
        description: "Good practices to maintain",
        color: "bg-blue-500/10 border-blue-500/20",
        icon: "TrendingUp",
        display_order: 2,
      },
    ],
  },
  {
    id: "4ls",
    name: "4Ls (Liked, Learned, Lacked, Longed For)",
    description: "Comprehensive reflection on the sprint experience",
    columns: [
      {
        column_type: "liked",
        title: "Liked",
        description: "What did you like?",
        color: "bg-green-500/10 border-green-500/20",
        icon: "Heart",
        display_order: 0,
      },
      {
        column_type: "learned",
        title: "Learned",
        description: "What did you learn?",
        color: "bg-blue-500/10 border-blue-500/20",
        icon: "Lightbulb",
        display_order: 1,
      },
      {
        column_type: "lacked",
        title: "Lacked",
        description: "What was missing?",
        color: "bg-orange-500/10 border-orange-500/20",
        icon: "AlertTriangle",
        display_order: 2,
      },
      {
        column_type: "longed-for",
        title: "Longed For",
        description: "What did you wish for?",
        color: "bg-purple-500/10 border-purple-500/20",
        icon: "Star",
        display_order: 3,
      },
    ],
  },
  {
    id: "sailboat",
    name: "Sailboat",
    description: "Metaphor-based retrospective using sailing concepts",
    columns: [
      {
        column_type: "wind",
        title: "Wind (What helps us)",
        description: "Forces that push us forward",
        color: "bg-blue-500/10 border-blue-500/20",
        icon: "TrendingUp",
        display_order: 0,
      },
      {
        column_type: "anchor",
        title: "Anchor (What holds us back)",
        description: "Things slowing us down",
        color: "bg-red-500/10 border-red-500/20",
        icon: "TrendingDown",
        display_order: 1,
      },
      {
        column_type: "rocks",
        title: "Rocks (Risks)",
        description: "Potential dangers ahead",
        color: "bg-orange-500/10 border-orange-500/20",
        icon: "AlertTriangle",
        display_order: 2,
      },
      {
        column_type: "island",
        title: "Island (Goals)",
        description: "Where we want to be",
        color: "bg-green-500/10 border-green-500/20",
        icon: "Target",
        display_order: 3,
      },
    ],
  },
  {
    id: "plus-delta",
    name: "Plus/Delta",
    description: "Simple format focusing on what to keep and what to change",
    columns: [
      {
        column_type: "plus",
        title: "Plus (+)",
        description: "What went well and should continue",
        color: "bg-green-500/10 border-green-500/20",
        icon: "ThumbsUp",
        display_order: 0,
      },
      {
        column_type: "delta",
        title: "Delta (Δ)",
        description: "What needs to change",
        color: "bg-yellow-500/10 border-yellow-500/20",
        icon: "TrendingUp",
        display_order: 1,
      },
    ],
  },
  {
    id: "daki",
    name: "DAKI (Drop, Add, Keep, Improve)",
    description: "Focus on what to drop, add, keep, and improve in your process",
    columns: [
      {
        column_type: "drop",
        title: "Drop",
        description: "Practices or activities to stop doing",
        color: "bg-red-500/10 border-red-500/20",
        icon: "X",
        display_order: 0,
      },
      {
        column_type: "add",
        title: "Add",
        description: "New practices or activities to start",
        color: "bg-green-500/10 border-green-500/20",
        icon: "Plus",
        display_order: 1,
      },
      {
        column_type: "keep",
        title: "Keep",
        description: "Good practices to continue",
        color: "bg-blue-500/10 border-blue-500/20",
        icon: "Check",
        display_order: 2,
      },
      {
        column_type: "improve",
        title: "Improve",
        description: "Things that need refinement",
        color: "bg-yellow-500/10 border-yellow-500/20",
        icon: "TrendingUp",
        display_order: 3,
      },
    ],
  },
];

export function getTemplateById(id: string): BoardTemplate | undefined {
  return boardTemplates.find((template) => template.id === id);
}

export function getDefaultTemplate(): BoardTemplate {
  return boardTemplates[0];
}