import Image from "next/image";

interface ArtifactSectionProps {
  imageUrl: string | null;
  imageCredit: string | null;
  title: string;
}

export default function ArtifactSection({
  imageUrl,
  imageCredit,
  title,
}: ArtifactSectionProps) {
  if (!imageUrl) return null;

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-border">
      <div className="relative w-full aspect-[16/10]">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 576px) 100vw, 576px"
          unoptimized
        />
      </div>
      {imageCredit && (
        <p className="text-xs text-muted px-3 py-2 bg-card-bg">
          Credit: {imageCredit}
        </p>
      )}
    </div>
  );
}
