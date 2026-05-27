import { DayCard as DayCardType } from "@/lib/types";
import YearDisplay from "./YearDisplay";
import TagPills from "./TagPills";
import WowSection from "./WowSection";
import ArtifactSection from "./ArtifactSection";
import SourceSection from "./SourceSection";

interface DayCardProps {
  card: DayCardType;
}

export default function DayCard({ card }: DayCardProps) {
  return (
    <article className="max-w-xl mx-auto px-5 py-10">
      <YearDisplay year={card.year} date={card.date} />

      <h1 className="font-serif text-2xl font-bold text-center mb-2 leading-snug">
        {card.title}
      </h1>
      <p className="text-sm text-muted text-center mb-6">{card.subtitle}</p>

      <TagPills tags={card.tags} />

      <p className="text-base leading-relaxed mb-2">{card.body}</p>

      <WowSection wow={card.wow} />

      <ArtifactSection
        imageUrl={card.image_url}
        imageCredit={card.image_credit}
        title={card.title}
      />

      <SourceSection
        sourceUrl={card.source_url}
        sourceTitle={card.source_title}
      />
    </article>
  );
}
