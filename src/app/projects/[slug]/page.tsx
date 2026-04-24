import { getProfile, getProjectByIdOrSlug } from '@/lib/db';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ProjectDetail from '@/components/project/ProjectDetail';
 
async function getProject(slug: string) {
  const [project, profile] = await Promise.all([getProjectByIdOrSlug(slug), getProfile()]);
  return { project, profile };
}

type Params = Promise<{ slug: string }>;

export default async function ProjectPage({ params }: { params: Params }) {
  await connection();
  const { slug } = await params;
  const { project, profile } = await getProject(slug);

  if (!project) {
    return notFound();
  }

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen">
      <Navbar profile={profile} />
      <main className="pt-24 min-h-screen">
        <ProjectDetail project={project} profile={profile} />
      </main>
      <Footer profile={profile} />
    </div>
  );
}
