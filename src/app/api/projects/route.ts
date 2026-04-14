import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getProjects, createProject } from '@/lib/db';
import { revalidatePublicSiteCache } from '@/lib/site-cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = !!(await getAuthUser());
    const visibility = searchParams.get('visibility');

    if (!isAdmin) {
      const projects = await getProjects('public');
      return NextResponse.json(projects);
    }

    const projects = visibility ? await getProjects(visibility) : await getProjects();
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const id = await createProject(data);
    revalidatePublicSiteCache();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
