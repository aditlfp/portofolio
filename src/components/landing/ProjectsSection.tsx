import Link from 'next/link';
import Image from 'next/image';
import AppIcon from '@/components/ui/AppIcon';

export default function ProjectsSection({ projects }: { projects: any[] }) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="projects">
      <div className="mb-16 space-y-4">
        <h2 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight">Selected <span className="text-primary">Works</span></h2>
        <div className="h-1 w-24 indigo-gradient-bg rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
        {projects.map((project) => (
          <div key={project.id}>
            <Link
              href={`/projects/${project.slug}`}
              className="group cursor-pointer space-y-6 block"
            >
              <div className="overflow-hidden rounded-3xl bg-surface-container-low ring-1 ring-outline-variant/10 relative transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_80px_rgba(79,70,229,0.15)]">
                <div className="aspect-[16/10] overflow-hidden relative">
                  <Image
                    src={project.thumbnail || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop'}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-headline font-bold">{project.title}</h3>
                  <p className="text-on-surface-variant font-body">{project.description}</p>
                </div>
                <AppIcon name="arrowForward" className="text-primary transition-transform duration-300 group-hover:translate-x-2" />
              </div>
              <div className="flex flex-wrap gap-3">
                {(Array.isArray(project.tags) ? project.tags : []).map((tag: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-surface-container-high rounded-lg text-xs font-label uppercase tracking-wider text-on-surface-variant">
                    {tag}
                  </span>
                ))}
                {project.category && (
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-label uppercase tracking-wider">
                    {project.category}
                  </span>
                )}
              </div>
            </Link>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-outline-variant/20 rounded-3xl">
            <AppIcon name="archive" className="mb-4 text-4xl text-on-surface-variant" />
            <p className="text-on-surface-variant italic">No projects added yet. Admin panel is ready for CRUD.</p>
          </div>
        )}
      </div>
    </section>
  );
}
