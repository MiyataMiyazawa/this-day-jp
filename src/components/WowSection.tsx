interface WowSectionProps {
  wow: string;
}

export default function WowSection({ wow }: WowSectionProps) {
  return (
    <div className="my-6 border-l-4 border-wow-border bg-wow-bg rounded-r-lg p-4">
      <p className="text-xs font-bold text-amber-700 tracking-widest mb-1">
        WAIT, REALLY?
      </p>
      <p className="text-sm text-foreground leading-relaxed">{wow}</p>
    </div>
  );
}
