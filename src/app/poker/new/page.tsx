import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { PokerSessionForm } from "@/components/poker/PokerSessionForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewPokerSessionPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header showAuth={true} />
      <div className="container max-w-7xl mx-auto py-8 px-4 pt-24">
        <Link href="/poker">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6"
            data-testid="back-to-sessions"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sessions
          </Button>
        </Link>
        <PokerSessionForm />
      </div>
    </main>
  );
}
