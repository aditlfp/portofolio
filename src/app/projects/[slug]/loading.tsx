export default function LoadingProjectPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16 animate-fade-in">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="h-[60vh] rounded-3xl bg-surface-container-high shimmer" />

        <div className="editorial-grid gap-12">
          <div className="col-span-12 md:col-span-7 space-y-6">
            <div className="h-4 w-36 rounded-full bg-surface-container shimmer" />
            <div className="h-16 w-3/4 rounded-3xl bg-surface-container-high shimmer" />
            <div className="space-y-3">
              <div className="h-5 w-full rounded-full bg-surface-container shimmer" />
              <div className="h-5 w-5/6 rounded-full bg-surface-container shimmer" />
              <div className="h-5 w-4/6 rounded-full bg-surface-container shimmer" />
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 md:col-start-9 space-y-6">
            <div className="rounded-3xl bg-surface-container-low p-8 space-y-4">
              <div className="h-4 w-32 rounded-full bg-surface-container shimmer" />
              <div className="flex flex-wrap gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-10 w-28 rounded-xl bg-surface-container-high shimmer" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
