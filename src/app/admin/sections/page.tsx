import React from 'react';
import SectionEditor from '@/components/admin/SectionEditor';
import { getProfile, getTechStack, getProjects, getCertificates, getExperience } from '@/lib/db';
import { connection } from 'next/server';

async function getLandingData() {
  const [profile, techStack, projects, certificates, experience] = await Promise.all([
    getProfile(),
    getTechStack(),
    getProjects('public'),
    getCertificates(),
    getExperience(),
  ]);
  return { profile, techStack, projects, certificates, experience };
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
