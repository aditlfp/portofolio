import Image from 'next/image';
import Link from 'next/link';
import AppIcon from '@/components/ui/AppIcon';
import { TbBrandLaravel } from 'react-icons/tb';

export default function HeroSection({ profile }: { profile: any }) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in" id="hero">
      <div className="editorial-grid gap-8 sm:gap-12 items-center text-center lg:text-left">
        <div className="col-span-12 lg:col-span-7 space-y-6 sm:space-y-8 flex flex-col items-center lg:items-start">
          <div className="space-y-3 sm:space-y-4">
            <span className="text-primary font-label text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold">
              Available for specialized projects
            </span>
            <h1 className="text-[42px] leading-[0.94] sm:text-5xl md:text-7xl font-headline font-extrabold tracking-tight text-on-background">
              Full Stack <span className="text-primary">Web</span> Developer.
            </h1>
            <p className="text-sm sm:text-lg text-on-surface-variant max-w-xl leading-relaxed break-words">
              {profile?.bio || 'I am a senior product designer and full-stack developer dedicated to crafting intentional, high-performance interfaces that bridge the gap between human intuition and technical precision.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6">
            <Link
              href="#projects"
              className="indigo-gradient-bg text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-95 text-sm sm:text-base"
            >
              View My Work
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center">
                  <TbBrandLaravel className="text-sm text-primary" />
                </div>
              </div>
              <span className="text-xs sm:text-sm font-label text-on-surface-variant">Top Rated Expert</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="relative max-w-md mx-auto lg:max-w-none">
            <div className="aspect-square w-full rounded-3xl overflow-hidden shadow-2xl ring-1 ring-outline-variant/20 relative">
              <Image
                src={profile?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop'}
                alt={profile?.name || 'Professional Portrait'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 500px"
                fetchPriority="high"
                priority
              />
            </div>
            <div className="absolute -bottom-4 left-2 sm:-bottom-6 sm:-left-6 bg-surface-container-high p-3 sm:p-6 rounded-2xl shadow-xl ring-1 ring-outline-variant/10 z-10">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 bg-primary-container/20 rounded-lg">
                  <AppIcon name="sparkles" className="text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-base sm:text-xl font-bold font-headline">{profile?.years_experience || '8+ Years'}</div>
                  <div className="text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wider">Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
