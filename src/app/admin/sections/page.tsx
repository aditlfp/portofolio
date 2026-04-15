import React from 'react';
import SectionEditor from '@/components/admin/SectionEditor';
import { getProfile, getTechStack, getProjects, getCertificates } from '@/lib/db';
import { connection } from 'next/server';

async function getLandingData() {
  const [profile, techStack, projects, certificates] = await Promise.all([
    getProfile(),
    getTechStack(),
    getProjects('public'),
    getCertificates(),
  ]);
  return { profile, techStack, projects, certificates };
}

export default async function SectionsPage() {
  await connection();
  const initialData = await getLandingData();

  return (
    <div className="py-8">
      <SectionEditor data={initialData} />
    </div>
  );
}
