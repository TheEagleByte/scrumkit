import { Metadata } from "next";
import Link from "next/link";
import { getUserBoards } from "@/lib/boards/actions";
import { BoardList } from "@/components/BoardList";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid } from "lucide-react";

export const metadata: Metadata = {
  title: "My Boards - ScrumKit",
  description: "Manage your retrospective boards",
};

export default async function BoardsPage() {
  const boards = await getUserBoards();

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <LayoutGrid className="h-9 w-9" />
              My Boards
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your retrospective boards
            </p>
          </div>
          <Link href="/boards/new">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              New Board
            </Button>
          </Link>
        </div>

        {/* Board List */}
        <BoardList boards={boards} />

        {/* Info Box for Anonymous Users */}
        <div className="mt-12 rounded-lg bg-muted p-6">
          <h3 className="font-semibold mb-2">Your boards are saved locally</h3>
          <p className="text-sm text-muted-foreground mb-4">
            As an anonymous user, your boards are saved in your browser. Clear your
            cookies and you&apos;ll lose access to managing these boards (though the boards
            will remain accessible via their unique URLs).
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Pro tip:</strong> Bookmark your important board URLs or sign up
            for an account to permanently save your boards.
          </p>
        </div>
      </div>
    </main>
  );
}