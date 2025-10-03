import { Header } from "@/components/layout/Header";
import { PokerSessionForm } from "@/components/poker/PokerSessionForm";

export default function NewPokerSessionPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header showAuth={true} />
      <div className="container max-w-7xl mx-auto py-8 px-4 pt-24">
        <PokerSessionForm />
      </div>
    </main>
  );
}
