interface SourceSectionProps {
  sourceUrl: string;
  sourceTitle: string;
}

export default function SourceSection({
  sourceUrl,
  sourceTitle,
}: SourceSectionProps) {
  return (
    <div className="mt-6 pt-4 border-t border-border">
      <p className="text-xs text-muted mb-1">出典</p>
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-accent hover:underline break-all"
      >
        {sourceTitle} - Wikipedia
      </a>
    </div>
  );
}
