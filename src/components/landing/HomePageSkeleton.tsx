export default function HomePageSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="bg-surface text-on-surface min-h-screen animate-fade-in"
    >
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-center p-2 sm:p-4">
        <div className="h-18 w-full max-w-7xl rounded-xl bg-surface-container/80 ring-1 ring-outline-variant/10 backdrop-blur-xl" />
      </div>

      <main className="mx-auto flex max-w-7xl flex-col gap-14 sm:gap-20 px-4 sm:px-6 lg:px-8 pb-24 pt-24 sm:pt-32">
        <section className="editorial-grid items-center gap-12">
          <div className="col-span-12 space-y-6 lg:col-span-7">
            <div className="h-4 w-44 rounded-full bg-surface-container-high shimmer" />
            <div className="space-y-3">
              <div className="h-16 w-full max-w-3xl rounded-3xl bg-surface-container-high shimmer" />
              <div className="h-16 w-5/6 rounded-3xl bg-surface-container-high shimmer" />
            </div>
            <div className="space-y-3">
              <div className="h-5 w-full max-w-2xl rounded-full bg-surface-container shimmer" />
              <div className="h-5 w-4/5 rounded-full bg-surface-container shimmer" />
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="h-14 w-40 rounded-2xl bg-surface-container-high shimmer" />
              <div className="h-14 w-48 rounded-2xl bg-surface-container shimmer" />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <div className="relative mx-auto aspect-square max-w-md rounded-[2rem] bg-surface-container-high shimmer ring-1 ring-outline-variant/10" />
          </div>
        </section>

        <section className="space-y-8">
          <div className="space-y-3">
            <div className="h-10 w-72 rounded-2xl bg-surface-container-high shimmer" />
            <div className="h-4 w-64 rounded-full bg-surface-container shimmer" />
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex h-36 flex-col items-center justify-center gap-4 rounded-2xl bg-surface-container-high shimmer"
              />
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="h-10 w-56 rounded-2xl bg-surface-container-high shimmer" />
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="space-y-5">
                <div className="aspect-[16/10] rounded-[2rem] bg-surface-container-high shimmer" />
                <div className="space-y-3">
                  <div className="h-8 w-3/4 rounded-xl bg-surface-container-high shimmer" />
                  <div className="h-4 w-full rounded-full bg-surface-container shimmer" />
                  <div className="h-4 w-2/3 rounded-full bg-surface-container shimmer" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
