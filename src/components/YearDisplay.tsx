interface YearDisplayProps {
  year: number;
  date: string;
}

export default function YearDisplay({ year, date }: YearDisplayProps) {
  return (
    <div className="text-center mb-6">
      <p className="text-sm text-muted tracking-widest uppercase mb-1">
        {date}
      </p>
      {year > 0 && (
        <p className="font-serif text-8xl font-black text-foreground leading-none tracking-tight">
          {year}
        </p>
      )}
    </div>
  );
}
