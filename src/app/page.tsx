import DayCard from "@/components/DayCard";
import { getDayCard } from "@/lib/pipeline";

export const dynamic = "force-dynamic";

export default async function Home() {
  const card = await getDayCard();

  return (
    <main className="flex-1 flex items-center justify-center">
      <DayCard card={card} />
    </main>
  );
}
