import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import TechStackSection from '@/components/landing/TechStackSection';
import ProjectsSection from '@/components/landing/ProjectsSection';
import CertificatesSection from '@/components/landing/CertificatesSection';
import ContactSection from '@/components/landing/ContactSection';
import CustomBuilderSection from '@/components/landing/CustomBuilderSection';
import Footer from '@/components/landing/Footer';
import HomePageExperience from '@/components/landing/HomePageExperience';
import HomePageSkeleton from '@/components/landing/HomePageSkeleton';
import SectionBlobDivider from '@/components/landing/SectionBlobDivider';
import { getCachedHomePageData } from '@/lib/site-cache';

type HomeSection = {
  id: string;
  config: unknown;
};

type SectionTone = 'surface' | 'surface-low';

type RenderableHomeSection = {
  id: string;
  node: React.ReactNode;
  tone: SectionTone;
  boundaryColor: string;
};

const dividerVariants = ['alpha', 'beta', 'gamma'] as const;

const getSectionTone = (sectionId: string): SectionTone => {
  if (sectionId === 'tech-stack' || sectionId === 'certificates') return 'surface-low';
  return 'surface';
};

const getSectionBoundaryColor = (sectionId: string): string => {
  if (sectionId === 'tech-stack' || sectionId === 'certificates') return 'var(--color-surface-container-low)';
  return 'var(--color-surface)';
};

export default async function Home() {
  const { profile, sections, techStack, projects, certificates } = await getCachedHomePageData();

  const sectionMap: Record<string, (key: string) => React.ReactNode> = {
    'hero': (key) => <HeroSection key={key} profile={profile} />,
    'tech-stack': (key) => <TechStackSection key={key} techStack={techStack} />,
    'projects': (key) => <ProjectsSection key={key} projects={projects} />,
    'certificates': (key) => <CertificatesSection key={key} certificates={certificates} />,
    'contact': (key) => <ContactSection key={key} profile={profile} />
  };

  const renderableSections: RenderableHomeSection[] = sections.flatMap((section: HomeSection) => {
    if (section.id.startsWith('custom-builder')) {
      return {
        id: section.id,
        node: <CustomBuilderSection key={section.id} encodedConfig={section.config} />,
        tone: 'surface',
        boundaryColor: 'var(--color-surface)'
      };
    }

    const renderSection = sectionMap[section.id];
    if (!renderSection) return [];

    return {
      id: section.id,
      node: renderSection(section.id),
      tone: getSectionTone(section.id),
      boundaryColor: getSectionBoundaryColor(section.id)
    };
  });

  return (
    <HomePageExperience skeleton={<HomePageSkeleton />}>
      <div className="bg-surface text-on-surface font-body min-h-screen">
        <Navbar profile={profile} />

        <main className="pt-28 sm:pt-32 pb-16 sm:pb-24 overflow-x-hidden">
          {renderableSections.map((section, index) => {
            const previousBoundaryColor = renderableSections[index - 1]?.boundaryColor ?? section.boundaryColor;
            const variant = dividerVariants[index % dividerVariants.length];

            return (
              <div
                key={`shell-${section.id}`}
                className={`landing-section-shell landing-section-shell--${section.tone}`}
                style={{ backgroundColor: section.boundaryColor }}
              >
                {index > 0 && (
                  <SectionBlobDivider
                    position="top"
                    fromColor={previousBoundaryColor}
                    toColor={section.boundaryColor}
                    variant={variant}
                    intensity="medium"
                    animate
                  />
                )}
                <div className="relative z-10">{section.node}</div>
              </div>
            );
          })}
        </main>

        <Footer profile={profile} />
      </div>
    </HomePageExperience>
  );
}
