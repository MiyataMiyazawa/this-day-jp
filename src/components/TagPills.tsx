interface TagPillsProps {
  tags: [string, string, string];
}

export default function TagPills({ tags }: TagPillsProps) {
  return (
    <div className="flex gap-2 justify-center mb-4">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
