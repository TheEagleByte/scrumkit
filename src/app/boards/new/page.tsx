import { Metadata } from "next";
import Link from "next/link";
import { BoardCreationForm } from "@/components/BoardCreationForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Create New Board - ScrumKit",
  description: "Create a new retrospective board for your team",
};

export default function NewBoardPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/boards">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Boards
            </Button>
          </Link>

          <h1 className="text-4xl font-bold mb-2">Create New Board</h1>
          <p className="text-xl text-muted-foreground">
            Start your team&apos;s retrospective in seconds
          </p>
        </div>

        {/* Creation Form */}
        <div className="bg-card rounded-lg border p-6">
          <BoardCreationForm />
        </div>
      </div>
    </main>
  );
}