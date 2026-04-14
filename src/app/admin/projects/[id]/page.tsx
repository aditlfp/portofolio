import React from 'react';
import { getProjectByIdOrSlug } from '@/lib/db';
import ProjectForm from '@/components/admin/ProjectForm';
import { notFound } from 'next/navigation';

async function getProjectData(id: string) {
  try {
    return await getProjectByIdOrSlug(id);
  } catch (error) {
    return null;
  }
}

type Params = Promise<{ id: string }>;

export default async function EditProjectPage({ params }: { params: Params }) {
  const { id } = await params;
  const project = await getProjectData(id);

  if (!project) {
    return notFound();
  }

  return (
    <div className="py-8">
      <ProjectForm initialData={project} id={id} />
    </div>
  );
}
