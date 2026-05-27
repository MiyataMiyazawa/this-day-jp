export default function Loading() {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="max-w-xl mx-auto px-5 py-10 animate-pulse">
        <div className="text-center mb-6">
          <div className="h-4 w-24 bg-border rounded mx-auto mb-2" />
          <div className="h-20 w-40 bg-border rounded mx-auto" />
        </div>
        <div className="h-8 w-3/4 bg-border rounded mx-auto mb-2" />
        <div className="h-4 w-1/2 bg-border rounded mx-auto mb-6" />
        <div className="flex gap-2 justify-center mb-4">
          <div className="h-6 w-16 bg-border rounded-full" />
          <div className="h-6 w-16 bg-border rounded-full" />
          <div className="h-6 w-16 bg-border rounded-full" />
        </div>
        <div className="space-y-2 mb-6">
          <div className="h-4 w-full bg-border rounded" />
          <div className="h-4 w-full bg-border rounded" />
          <div className="h-4 w-5/6 bg-border rounded" />
        </div>
        <div className="h-20 w-full bg-border rounded-lg" />
      </div>
    </main>
  );
}
