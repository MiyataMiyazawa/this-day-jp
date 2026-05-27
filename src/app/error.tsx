"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="max-w-xl mx-auto px-5 py-10 text-center">
        <p className="font-serif text-6xl font-black text-foreground mb-4">
          ?
        </p>
        <h2 className="text-lg font-bold mb-2">
          歴史の扉が開きませんでした
        </h2>
        <p className="text-sm text-muted mb-6">
          データの取得中にエラーが発生しました。
        </p>
        <button
          onClick={reset}
          className="px-6 py-2 text-sm font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition-colors"
        >
          もう一度試す
        </button>
      </div>
    </main>
  );
}
