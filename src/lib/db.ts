// @ts-nocheck

import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

type ProviderName = 'sqlite' | 'mongodb' | 'supabase';

declare global {
  var __mongoClient: MongoClient | undefined;
  var __supabaseClient: ReturnType<typeof createSupabaseClient> | undefined;
}

// Validate DB_PROVIDER configuration
const validateDbProvider = (): ProviderName => {
  const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
  const isProduction = process.env.NODE_ENV === 'production';

  const provider = (process.env.DB_PROVIDER).toLowerCase() as ProviderName;

  console.log('🔍 DB_PROVIDER validation:', {
    DB_PROVIDER: process.env.DB_PROVIDER,
    provider,
    isVercel,
    isProduction,
    MONGODB_URI: process.env.MONGODB_URI ? '[SET]' : '[NOT SET]',
    SUPABASE_URL: process.env.SUPABASE_URL ? '[SET]' : '[NOT SET]',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV
  });

  if (!['sqlite', 'mongodb', 'supabase'].includes(provider)) {
    console.warn(`❌ Invalid DB_PROVIDER: ${provider}. Defaulting to sqlite.`);
    return 'sqlite';
  }

  if (isVercel && isProduction && provider === 'sqlite') {
    console.warn('⚠️ SQLite detected in Vercel production.');
  }

  if (provider == 'mongodb') {
    if (!process.env.MONGODB_URI) {
      console.warn('❌ MONGODB_URI not set. Defaulting to sqlite.');
      return 'sqlite';
    }
    return 'mongodb';
  }

  if (provider == 'supabase') {
    if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY)) {
      console.warn('❌ Supabase config missing. Defaulting to sqlite.');
      return 'sqlite';
    }
    return 'supabase';
  }

  return 'sqlite';
};

const providerName = validateDbProvider();

const getDefaultAdminCredentials = () => {
  const username = (process.env.DEFAULT_ADMIN_USERNAME || '').trim();
  const password = process.env.DEFAULT_ADMIN_PASSWORD || '';

  return {
    username,
    password,
    isConfigured: username.length > 0 && password.length > 0,
  };
};

function parseJson<T>(value: any, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function normalizeSection(section: any) {
  return {
    ...section,
    id: section?.id ?? (section?._id?.toString?.() ?? section?._id),
    config: parseJson(section.config, {}),
    visible: section.visible === 1 || section.visible === true,
  };
}

function normalizeProject(project: any) {
  if (!project) return null;
  const pickText = (...values: any[]) => {
    for (const value of values) {
      if (typeof value === 'string' && value.trim().length > 0) return value;
    }
    return '';
  };

  const titleEn = project.title_en ?? null;
  const titleId = project.title_id ?? null;
  const descriptionEn = project.description_en ?? null;
  const descriptionId = project.description_id ?? null;
  const longDescriptionEn = project.long_description_en ?? null;
  const longDescriptionId = project.long_description_id ?? null;
  const categoryEn = project.category_en ?? null;
  const categoryId = project.category_id ?? null;

  return {
    ...project,
    id: project?.id ?? (project?._id?.toString?.() ?? project?._id),
    title_en: titleEn,
    title_id: titleId,
    description_en: descriptionEn,
    description_id: descriptionId,
    long_description_en: longDescriptionEn,
    long_description_id: longDescriptionId,
    category_en: categoryEn,
    category_id: categoryId,
    title: pickText(project.title, titleEn, titleId),
    description: pickText(project.description, descriptionEn, descriptionId),
    long_description: pickText(project.long_description, longDescriptionEn, longDescriptionId),
    category: pickText(project.category, categoryEn, categoryId),
    tags: parseJson(project.tags, []),
    gallery: parseJson(project.gallery, []),
    tech_stack: parseJson(project.tech_stack, []),
    stats: parseJson(project.stats, {}),
    created_at: project.created_at ? new Date(project.created_at).toISOString() : null,
    updated_at: project.updated_at ? new Date(project.updated_at).toISOString() : null,
  };
}

function normalizeContact(contact: any) {
  if (!contact) return null;
  return {
    ...contact,
    id: contact?.id ?? (contact?._id?.toString?.() ?? contact?._id),
    read: contact.read === 1 || contact.read === true,
  };
}

const REQUIRED_SECTIONS = [
  { id: 'hero', label: 'Hero' },
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'tech-stack', label: 'Tech Stack' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
] as const;

const REQUIRED_SECTION_ID_SET = new Set(REQUIRED_SECTIONS.map((section) => section.id));
const LEGACY_SECTION_ID_SET = new Set(['certificates']);

function reconcileSections(items: any[]) {
  const normalizedItems = (items || []).map(normalizeSection);
  const byId = new Map<string, any>();

  for (const item of normalizedItems) {
    if (!item?.id || byId.has(item.id)) continue;
    byId.set(item.id, item);
  }

  const required = REQUIRED_SECTIONS.map((section, index) => {
    const existing = byId.get(section.id);
    return {
      id: section.id,
      label: existing?.label || section.label,
      sort_order: index,
      visible: existing?.visible ?? true,
      config: existing?.config || {},
    };
  });

  const customCandidates = normalizedItems
    .filter((item) => item?.id && !REQUIRED_SECTION_ID_SET.has(item.id) && !LEGACY_SECTION_ID_SET.has(item.id))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const seen = new Set(required.map((item) => item.id));
  const custom = customCandidates.flatMap((item, index) => {
    if (seen.has(item.id)) return [];
    seen.add(item.id);
    return {
      id: item.id,
      label: item.label || 'Custom Block',
      sort_order: REQUIRED_SECTIONS.length + index,
      visible: item.visible ?? true,
      config: item.config || {},
    };
  });

  return [...required, ...custom];
}

function normalizeExperience(item: any) {
  if (!item) return null;
  return {
    ...item,
    id: item?.id ?? (item?._id?.toString?.() ?? item?._id),
    sort_order: Number.isFinite(item?.sort_order) ? item.sort_order : 0,
    role: item.role ?? item.role_en ?? item.role_id ?? '',
    role_en: item.role_en ?? item.role ?? '',
    role_id: item.role_id ?? '',
    company: item.company ?? item.company_en ?? item.company_id ?? '',
    company_en: item.company_en ?? item.company ?? '',
    company_id: item.company_id ?? '',
    period: item.period ?? item.period_en ?? item.period_id ?? '',
    period_en: item.period_en ?? item.period ?? '',
    period_id: item.period_id ?? '',
    location: item.location ?? item.location_en ?? item.location_id ?? '',
    location_en: item.location_en ?? item.location ?? '',
    location_id: item.location_id ?? '',
    description: item.description ?? item.description_en ?? item.description_id ?? '',
    description_en: item.description_en ?? item.description ?? '',
    description_id: item.description_id ?? '',
  };
}

const createSqliteProvider = (() => {
  console.log('🔧 Initializing SQLite provider...');

  // Check if we're in Vercel (serverless environment)
  const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isVercel && isProduction) {
    console.warn('⚠️  SQLite is not suitable for Vercel production. Consider using MongoDB or Supabase.');
    console.warn('⚠️  Vercel serverless functions have read-only file systems.');
  }

  const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), 'database.sqlite');
  console.log('📁 SQLite database path:', dbPath);

  let db: Database.Database | null = null;

  try {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    console.log('✅ SQLite database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize SQLite database:', error);
    if (isVercel) {
      console.error('💡 This is likely because Vercel serverless functions cannot write to the file system.');
      console.error('💡 Please use MongoDB or Supabase for production deployments.');
    }
    throw error;
  }

  const addColumnIfNotExists = (table: string, column: string, type: string) => {
    const columns = db.pragma(`table_info(${table})`) as { name: string }[];
    if (!columns.some(col => col.name === column)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    }
  };

  db.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY DEFAULT 1,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      bio TEXT NOT NULL,
      avatar TEXT DEFAULT '/img/avatar.jpg',
      email TEXT,
      location TEXT,
      years_experience TEXT DEFAULT '8+',
      resume_url TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      visible INTEGER DEFAULT 1,
      config TEXT DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      long_description TEXT,
      category TEXT,
      tags TEXT DEFAULT '[]',
      thumbnail TEXT,
      hero_image TEXT,
      gallery TEXT DEFAULT '[]',
      tech_stack TEXT DEFAULT '[]',
      stats TEXT DEFAULT '{}',
      live_url TEXT,
      repo_url TEXT,
      visibility TEXT DEFAULT 'public',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      year TEXT,
      image TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS tech_stack (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT DEFAULT 'code',
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS experience (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      role_en TEXT,
      role_id TEXT,
      company TEXT NOT NULL,
      company_en TEXT,
      company_id TEXT,
      period TEXT,
      period_en TEXT,
      period_id TEXT,
      location TEXT,
      location_en TEXT,
      location_id TEXT,
      description TEXT,
      description_en TEXT,
      description_id TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      interest TEXT,
      message TEXT,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY DEFAULT 1,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );
  `);

  // Add bilingual columns
  addColumnIfNotExists('profile', 'name_en', 'TEXT');
  addColumnIfNotExists('profile', 'name_id', 'TEXT');
  addColumnIfNotExists('profile', 'title_en', 'TEXT');
  addColumnIfNotExists('profile', 'title_id', 'TEXT');
  addColumnIfNotExists('profile', 'bio_en', 'TEXT');
  addColumnIfNotExists('profile', 'bio_id', 'TEXT');
  addColumnIfNotExists('profile', 'location_en', 'TEXT');
  addColumnIfNotExists('profile', 'location_id', 'TEXT');
  addColumnIfNotExists('profile', 'years_experience_en', 'TEXT');
  addColumnIfNotExists('profile', 'years_experience_id', 'TEXT');

  addColumnIfNotExists('projects', 'title_en', 'TEXT');
  addColumnIfNotExists('projects', 'title_id', 'TEXT');
  addColumnIfNotExists('projects', 'category_en', 'TEXT');
  addColumnIfNotExists('projects', 'category_id', 'TEXT');
  addColumnIfNotExists('projects', 'description_en', 'TEXT');
  addColumnIfNotExists('projects', 'description_id', 'TEXT');
  addColumnIfNotExists('projects', 'long_description_en', 'TEXT');
  addColumnIfNotExists('projects', 'long_description_id', 'TEXT');

  addColumnIfNotExists('tech_stack', 'name_en', 'TEXT');
  addColumnIfNotExists('tech_stack', 'name_id', 'TEXT');

  addColumnIfNotExists('certificates', 'title_en', 'TEXT');
  addColumnIfNotExists('certificates', 'title_id', 'TEXT');

  const seed = () => {
    const settingsCount = db.prepare('SELECT count(*) as count FROM settings').get() as { count: number };
    if (settingsCount.count === 0) {
      const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
      insertSetting.run('theme_mode', 'dark');
      insertSetting.run('primary_color', '#c3c0ff');
    }

    const adminCreds = getDefaultAdminCredentials();
    if (adminCreds.isConfigured) {
      const hash = bcrypt.hashSync(adminCreds.password, 10);
      db.prepare(`
        INSERT INTO admin_users (username, password_hash)
        VALUES (?, ?)
        ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash
      `).run(adminCreds.username, hash);
    } else {
      console.warn('Default admin account is not configured. Set DEFAULT_ADMIN_USERNAME and DEFAULT_ADMIN_PASSWORD in .env');
    }

    const profileCount = db.prepare('SELECT count(*) as count FROM profile').get() as { count: number };
    if (profileCount.count === 0) {
      db.prepare(`
        INSERT INTO profile (name, title, bio, email, location, years_experience) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        'Aditya',
        'Senior Product Designer & Full-Stack Developer',
        'I am a senior product designer and full-stack developer dedicated to crafting intentional, high-performance interfaces that bridge the gap between human intuition and technical precision.',
        'hello@executive.design',
        'San Francisco, CA',
        '8+'
      );
    }

    const sectionCount = db.prepare('SELECT count(*) as count FROM sections').get() as { count: number };
    if (sectionCount.count === 0) {
      const sections = REQUIRED_SECTIONS.map((section, index) => ({
        id: section.id,
        label: section.label,
        sort_order: index,
      }));
      const insert = db.prepare('INSERT INTO sections (id, label, sort_order) VALUES (?, ?, ?)');
      sections.forEach(s => insert.run(s.id, s.label, s.sort_order));
    }
  };

  seed();

  const migrateToBilingual = () => {
    // Profile
    const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get() as any;
    if (profile && profile.name && !profile.name_en) {
      db.prepare('UPDATE profile SET name_en = name, title_en = title, bio_en = bio, location_en = location, years_experience_en = years_experience WHERE id = 1').run();
    }

    // Projects
    db.prepare('UPDATE projects SET title_en = title, category_en = category, description_en = description, long_description_en = long_description WHERE title_en IS NULL').run();

    // Tech stack
    db.prepare('UPDATE tech_stack SET name_en = name WHERE name_en IS NULL').run();

    // Certificates
    db.prepare('UPDATE certificates SET title_en = title WHERE title_en IS NULL').run();
  };

  migrateToBilingual();

  const getSettings = async () => {
    const rows = db.prepare('SELECT * FROM settings').all() as { key: string; value: string }[];
    return rows.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), { theme_mode: 'dark', primary_color: '#c3c0ff' });
  };

  const updateSettings = async (settings: Record<string, string>) => {
    const update = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    const transaction = db.transaction((entries: [string, string][]) => {
      for (const [key, value] of entries) {
        update.run(key, value);
      }
    });
    transaction(Object.entries(settings));
  };

  const getProfile = async () => db.prepare('SELECT * FROM profile WHERE id = 1').get();
  const updateProfile = async (data: any) => {
    db.prepare(`
      UPDATE profile SET
      name = COALESCE(?, name), name_en = COALESCE(?, name), name_id = ?,
      title = COALESCE(?, title), title_en = COALESCE(?, title), title_id = ?,
      bio = COALESCE(?, bio), bio_en = COALESCE(?, bio), bio_id = ?,
      avatar = ?, email = ?,
      location = COALESCE(?, location), location_en = COALESCE(?, location), location_id = ?,
      years_experience = COALESCE(?, years_experience), years_experience_en = COALESCE(?, years_experience), years_experience_id = ?,
      resume_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      data.name, data.name_en, data.name_id,
      data.title, data.title_en, data.title_id,
      data.bio, data.bio_en, data.bio_id,
      data.avatar, data.email,
      data.location, data.location_en, data.location_id,
      data.years_experience, data.years_experience_en, data.years_experience_id,
      data.resume_url
    );
  };

  const getSections = async () => {
    const rows = db.prepare('SELECT * FROM sections ORDER BY sort_order ASC').all();
    return reconcileSections(rows);
  };
  const saveSections = async (sections: any[]) => {
    const reconciledSections = reconcileSections(sections);
    const upsert = db.prepare(`
      INSERT INTO sections (id, label, sort_order, visible, config)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        label = COALESCE(excluded.label, sections.label),
        sort_order = excluded.sort_order,
        visible = excluded.visible,
        config = COALESCE(excluded.config, sections.config)
    `);
    const existingCustom = db.prepare("SELECT id FROM sections WHERE id LIKE 'custom-builder-%'").all() as { id: string }[];
    const incoming = new Set(reconciledSections.map((item) => item.id));
    const deleteStmt = db.prepare('DELETE FROM sections WHERE id = ?');
    const transaction = db.transaction((items: any[]) => {
      for (const existing of existingCustom) {
        if (!incoming.has(existing.id)) {
          deleteStmt.run(existing.id);
        }
      }
      for (const item of items) {
        upsert.run(item.id, item.label || null, item.sort_order, item.visible ? 1 : 0, JSON.stringify(item.config || {}));
      }
    });
    transaction(reconciledSections);
  };

  const updateSectionById = async (id: string, data: any) => {
    db.prepare('UPDATE sections SET label = ?, visible = ?, config = ? WHERE id = ?').run(
      data.label,
      data.visible ? 1 : 0,
      JSON.stringify(data.config || {}),
      id
    );
  };

  const getTechStack = async () => db.prepare('SELECT * FROM tech_stack ORDER BY sort_order ASC').all();
  const createTechItem = async (data: any) => {
    const result = db.prepare('INSERT INTO tech_stack (name, name_en, name_id, icon, sort_order) VALUES (?, ?, ?, ?, ?)').run(data.name, data.name_en, data.name_id, data.icon, data.sort_order || 0);
    return result.lastInsertRowid;
  };
  const updateTechItem = async (id: string, data: any) => {
    db.prepare('UPDATE tech_stack SET name = COALESCE(?, name), name_en = COALESCE(?, name), name_id = ?, icon = ?, sort_order = ? WHERE id = ?').run(data.name, data.name_en, data.name_id, data.icon, data.sort_order, id);
  };
  const deleteTechItem = async (id: string) => {
    db.prepare('DELETE FROM tech_stack WHERE id = ?').run(id);
  };

  const getProjects = async (visibility?: string) => {
    if (!visibility) {
      return db.prepare('SELECT * FROM projects ORDER BY sort_order ASC').all().map(normalizeProject);
    }
    const rows = db.prepare('SELECT * FROM projects WHERE visibility = ? ORDER BY sort_order ASC').all(visibility).map(normalizeProject);
    return rows;
  };
  const getProjectByIdOrSlug = async (idOrSlug: string) => db.prepare('SELECT * FROM projects WHERE id = ? OR slug = ?').get(idOrSlug, idOrSlug) as any;
  const createProject = async (data: any) => {
    const result = db.prepare(`
      INSERT INTO projects (
        title, title_en, title_id, slug, description, description_en, description_id, long_description, long_description_en, long_description_id, category, category_en, category_id, tags, thumbnail, hero_image, gallery, tech_stack, stats, live_url, repo_url, visibility, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.title, data.title_en, data.title_id,
      data.slug,
      data.description, data.description_en, data.description_id,
      data.long_description, data.long_description_en, data.long_description_id,
      data.category, data.category_en, data.category_id,
      JSON.stringify(data.tags || []),
      data.thumbnail,
      data.hero_image,
      JSON.stringify(data.gallery || []),
      JSON.stringify(data.tech_stack || []),
      JSON.stringify(data.stats || {}),
      data.live_url,
      data.repo_url,
      data.visibility || 'public',
      data.sort_order || 0
    );
    return result.lastInsertRowid;
  };
  const updateProject = async (id: string, data: any) => {
    db.prepare(`
      UPDATE projects SET 
      title = COALESCE(?, title), title_en = COALESCE(?, title), title_id = ?,
      slug = ?, 
      description = COALESCE(?, description), description_en = COALESCE(?, description), description_id = ?,
      long_description = COALESCE(?, long_description), long_description_en = COALESCE(?, long_description), long_description_id = ?,
      category = COALESCE(?, category), category_en = COALESCE(?, category), category_id = ?,
      tags = ?, thumbnail = ?, hero_image = ?, gallery = ?, tech_stack = ?, stats = ?, live_url = ?, repo_url = ?, visibility = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.title, data.title_en, data.title_id,
      data.slug,
      data.description, data.description_en, data.description_id,
      data.long_description, data.long_description_en, data.long_description_id,
      data.category, data.category_en, data.category_id,
      JSON.stringify(data.tags || []),
      data.thumbnail,
      data.hero_image,
      JSON.stringify(data.gallery || []),
      JSON.stringify(data.tech_stack || []),
      JSON.stringify(data.stats || {}),
      data.live_url,
      data.repo_url,
      data.visibility || 'public',
      data.sort_order || 0,
      id
    );
  };
  const deleteProject = async (id: string) => {
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  };

  const getCertificates = async () => db.prepare('SELECT * FROM certificates ORDER BY sort_order ASC').all();
  const createCertificate = async (data: any) => {
    const result = db.prepare('INSERT INTO certificates (title, title_en, title_id, year, image, sort_order) VALUES (?, ?, ?, ?, ?, ?)').run(data.title, data.title_en, data.title_id, data.year, data.image, data.sort_order || 0);
    return result.lastInsertRowid;
  };
  const updateCertificate = async (id: string, data: any) => {
    db.prepare('UPDATE certificates SET title = COALESCE(?, title), title_en = COALESCE(?, title), title_id = ?, year = ?, image = ?, sort_order = ? WHERE id = ?').run(data.title, data.title_en, data.title_id, data.year, data.image, data.sort_order || 0, id);
  };
  const deleteCertificate = async (id: string) => {
    db.prepare('DELETE FROM certificates WHERE id = ?').run(id);
  };

  const getExperience = async () =>
    db.prepare('SELECT * FROM experience ORDER BY sort_order ASC, id ASC').all().map(normalizeExperience);
  const createExperience = async (data: any) => {
    const result = db.prepare(`
      INSERT INTO experience (
        role, role_en, role_id, company, company_en, company_id, period, period_en, period_id,
        location, location_en, location_id, description, description_en, description_id, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.role || data.role_en || data.role_id || '',
      data.role_en || data.role || '',
      data.role_id || '',
      data.company || data.company_en || data.company_id || '',
      data.company_en || data.company || '',
      data.company_id || '',
      data.period || data.period_en || data.period_id || '',
      data.period_en || data.period || '',
      data.period_id || '',
      data.location || data.location_en || data.location_id || '',
      data.location_en || data.location || '',
      data.location_id || '',
      data.description || data.description_en || data.description_id || '',
      data.description_en || data.description || '',
      data.description_id || '',
      data.sort_order || 0
    );
    return result.lastInsertRowid;
  };
  const updateExperience = async (id: string, data: any) => {
    db.prepare(`
      UPDATE experience SET
        role = COALESCE(?, role), role_en = COALESCE(?, role_en), role_id = ?,
        company = COALESCE(?, company), company_en = COALESCE(?, company_en), company_id = ?,
        period = COALESCE(?, period), period_en = COALESCE(?, period_en), period_id = ?,
        location = COALESCE(?, location), location_en = COALESCE(?, location_en), location_id = ?,
        description = COALESCE(?, description), description_en = COALESCE(?, description_en), description_id = ?,
        sort_order = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.role, data.role_en, data.role_id,
      data.company, data.company_en, data.company_id,
      data.period, data.period_en, data.period_id,
      data.location, data.location_en, data.location_id,
      data.description, data.description_en, data.description_id,
      data.sort_order || 0,
      id
    );
  };
  const deleteExperience = async (id: string) => {
    db.prepare('DELETE FROM experience WHERE id = ?').run(id);
  };

  const getContacts = async () => db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all().map(normalizeContact);
  const createContact = async (data: any) => {
    db.prepare('INSERT INTO contacts (name, email, interest, message) VALUES (?, ?, ?, ?)').run(data.name, data.email, data.interest, data.message);
  };
  const markAllContactsRead = async () => {
    db.prepare('UPDATE contacts SET read = 1 WHERE read = 0').run();
  };
  const deleteContact = async (id: string) => {
    db.prepare('DELETE FROM contacts WHERE id = ?').run(id);
  };
  const countUnreadContacts = async () => {
    const result = db.prepare('SELECT count(*) as count FROM contacts WHERE read = 0').get() as { count: number };
    return result.count;
  };

  const getAdminUserByUsername = async (username: string) => db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  const countProjects = async () => {
    const result = db.prepare('SELECT count(*) as count FROM projects').get() as { count: number };
    return result.count;
  };
  const countCertificates = async () => {
    const result = db.prepare('SELECT count(*) as count FROM certificates').get() as { count: number };
    return result.count;
  };

  return {
    type: 'sqlite' as const,
    getSettings,
    updateSettings,
    getProfile,
    updateProfile,
    getSections,
    saveSections,
    updateSectionById,
    getTechStack,
    createTechItem,
    updateTechItem,
    deleteTechItem,
    getProjects,
    getProjectByIdOrSlug,
    createProject,
    updateProject,
    deleteProject,
    getCertificates,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    getExperience,
    createExperience,
    updateExperience,
    deleteExperience,
    getContacts,
    createContact,
    markAllContactsRead,
    deleteContact,
    countUnreadContacts,
    getAdminUserByUsername,
    countProjects,
    countCertificates,
    prepare: (sql: string) => db.prepare(sql),
  };
});

const createMongoProvider = (() => {
  console.log('🔧 Initializing MongoDB provider...');

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.MONGODB_DB || 'portfolio';

  console.log('🔗 MongoDB config:', {
    uri: uri ? '[SET]' : '[NOT SET]',
    dbName,
    hasUri: !!uri,
    uriLength: uri?.length || 0
  });
  
  let client: MongoClient | null = null;
  let connectionError: Error | null = null;

  const getClient = (): MongoClient => {
    if (!client) {
      client = globalThis.__mongoClient ?? new MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
      });
      globalThis.__mongoClient = client;
    }
    return client;
  };

  async function connection(): Promise<any> {
    try {
      const mongoClient = getClient();
      await mongoClient.connect();
      return mongoClient.db(dbName);
    } catch (error) {
      connectionError = error as Error;
      console.error(`MongoDB connection error: ${connectionError.message}. Falling back to default behavior.`);
      throw error;
    }
  }

  const safeTryConnection = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      console.error(`MongoDB operation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  };

  const getSettings = async () => {
    const db = await connection();
    const rows = await db.collection('settings').find().toArray();
    return rows.reduce((acc, item) => (item?.key ? { ...acc, [item.key]: item.value } : acc), { theme_mode: 'dark', primary_color: '#c3c0ff' });
  };

  const updateSettings = async (settings: Record<string, string>) => {
    const db = await connection();
    const collection = db.collection('settings');
    await Promise.all(Object.entries(settings).map(([key, value]) => collection.updateOne({ key }, { $set: { value } }, { upsert: true })));
  };

  const ensureSeed = async () => {
    try {
      const db = await connection();
      const adminCreds = getDefaultAdminCredentials();
      const seedOps: Promise<unknown>[] = [];

      seedOps.push(
        db.collection('settings').updateOne(
          { _id: 'theme_mode' },
          { $setOnInsert: { key: 'theme_mode', value: 'dark' } },
          { upsert: true }
        )
      );
      seedOps.push(
        db.collection('settings').updateOne(
          { _id: 'primary_color' },
          { $setOnInsert: { key: 'primary_color', value: '#c3c0ff' } },
          { upsert: true }
        )
      );
      if (adminCreds.isConfigured) {
        const hash = bcrypt.hashSync(adminCreds.password, 10);
        seedOps.push(
          db.collection('admin_users').updateOne(
            { username: adminCreds.username },
            { $set: { username: adminCreds.username, password_hash: hash } },
            { upsert: true }
          )
        );
      } else {
        console.warn('Default admin account is not configured. Set DEFAULT_ADMIN_USERNAME and DEFAULT_ADMIN_PASSWORD in .env');
      }
      seedOps.push(
        db.collection('profile').updateOne(
          { _id: 'profile:1' },
          {
            $setOnInsert: {
              id: 1,
              name: 'Aditya',
              title: 'Senior Product Designer & Full-Stack Developer',
              bio: 'I am a senior product designer and full-stack developer dedicated to crafting intentional, high-performance interfaces that bridge the gap between human intuition and technical precision.',
              email: 'hello@executive.design',
              location: 'San Francisco, CA',
              years_experience: '8+',
              avatar: '/img/avatar.jpg',
            },
          },
          { upsert: true }
        )
      );
      await Promise.all(seedOps);

      const baseSections = REQUIRED_SECTIONS.map((section, index) => ({
        _id: section.id,
        label: section.label,
        sort_order: index,
        visible: 1,
        config: '{}',
      }));

      await db.collection('sections').bulkWrite(
        baseSections.map((section) => ({
          updateOne: {
            filter: { _id: section._id },
            update: { $setOnInsert: section },
            upsert: true,
          },
        }))
      );
    } catch (error) {
      console.error(`MongoDB seed initialization failed: ${error instanceof Error ? error.message : String(error)}`);
      // Don't throw error - allow fallback to continue
    }
  };

  const getProfile = async () => {
    const db = await connection();
    return await db.collection('profile').findOne({ id: 1 });
  };

  const updateProfile = async (data: any) => {
    const db = await connection();
    await db.collection('profile').updateOne(
      { id: 1 },
      { $set: { ...data, updated_at: new Date().toISOString() } },
      { upsert: true }
    );
  };

  const getSections = async () => {
    const db = await connection();
    const rows = await db.collection('sections').find().sort({ sort_order: 1 }).toArray();
    return reconcileSections(rows);
  };

  const saveSections = async (sections: any[]) => {
    const reconciledSections = reconcileSections(sections);
    const db = await connection();
    const collection = db.collection('sections');
    const existingCustom = await collection.find({ _id: { $regex: '^custom-builder-' } }).project({ _id: 1 }).toArray();
    const incomingIds = new Set(reconciledSections.map((item) => item.id));
    await Promise.all(
      existingCustom.map((item) => {
        if (!incomingIds.has(item._id)) {
          return collection.deleteOne({ _id: item._id });
        }
        return Promise.resolve();
      })
    );
    await Promise.all(
      reconciledSections.map((item) =>
        collection.updateOne(
          { _id: item.id },
          {
            $set: {
              label: item.label || null,
              sort_order: item.sort_order,
              visible: item.visible ? 1 : 0,
              config: JSON.stringify(item.config || {}),
            },
          },
          { upsert: true }
        )
      )
    );
  };

  const updateSectionById = async (id: string, data: any) => {
    const db = await connection();
    await db.collection('sections').updateOne(
      { _id: id },
      { $set: { label: data.label, visible: data.visible ? 1 : 0, config: JSON.stringify(data.config || {}) } }
    );
  };

  const getTechStack = async () => {
    const db = await connection();
    return (await db.collection('tech_stack').find().sort({ sort_order: 1 }).toArray()).map((item: any) => ({
      ...item,
      id: item?.id ?? (item?._id?.toString?.() ?? item?._id),
    }));
  };

  const createTechItem = async (data: any) => {
    const db = await connection();
    const result = await db.collection('tech_stack').insertOne({ _id: randomUUID(), ...data, sort_order: data.sort_order || 0 });
    return result.insertedId.toString();
  };

  const updateTechItem = async (id: string, data: any) => {
    const db = await connection();
    await db.collection('tech_stack').updateOne({ _id: id }, { $set: { name: data.name, icon: data.icon, sort_order: data.sort_order || 0 } });
  };

  const deleteTechItem = async (id: string) => {
    const db = await connection();
    await db.collection('tech_stack').deleteOne({ _id: id });
  };

  const getProjects = async (visibility?: string) => {
    const db = await connection();
    const filter = visibility ? { visibility } : {};
    return (await db.collection('projects').find(filter).sort({ sort_order: 1 }).toArray()).map(normalizeProject);
  };

  const getProjectByIdOrSlug = async (idOrSlug: string) => {
    const db = await connection();
    const project = await db
      .collection('projects')
      .findOne({ $or: [{ _id: idOrSlug }, { slug: idOrSlug }] });
    return normalizeProject(project);
  };

  const createProject = async (data: any) => {
    const db = await connection();
    const record = {
      _id: data.id || randomUUID(),
      title: data.title || data.title_en || data.title_id || '',
      title_en: data.title_en || data.title || '',
      title_id: data.title_id || '',
      slug: data.slug,
      description: data.description || data.description_en || data.description_id || '',
      description_en: data.description_en || data.description || '',
      description_id: data.description_id || '',
      long_description: data.long_description || data.long_description_en || data.long_description_id || '',
      long_description_en: data.long_description_en || data.long_description || '',
      long_description_id: data.long_description_id || '',
      category: data.category || data.category_en || data.category_id || '',
      category_en: data.category_en || data.category || '',
      category_id: data.category_id || '',
      tags: parseJson(data.tags, []),
      thumbnail: data.thumbnail,
      hero_image: data.hero_image,
      gallery: parseJson(data.gallery, []),
      tech_stack: parseJson(data.tech_stack, []),
      stats: parseJson(data.stats, {}),
      live_url: data.live_url,
      repo_url: data.repo_url,
      visibility: data.visibility || 'public',
      sort_order: data.sort_order || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const result = await db.collection('projects').insertOne(record);
    return result.insertedId.toString();
  };

  const updateProject = async (id: string, data: any) => {
    const db = await connection();
    await db.collection('projects').updateOne(
      { $or: [{ _id: id }, { slug: id }] },
      {
        $set: {
          title: data.title || data.title_en || data.title_id || '',
          title_en: data.title_en || data.title || '',
          title_id: data.title_id || '',
          slug: data.slug,
          description: data.description || data.description_en || data.description_id || '',
          description_en: data.description_en || data.description || '',
          description_id: data.description_id || '',
          long_description: data.long_description || data.long_description_en || data.long_description_id || '',
          long_description_en: data.long_description_en || data.long_description || '',
          long_description_id: data.long_description_id || '',
          category: data.category || data.category_en || data.category_id || '',
          category_en: data.category_en || data.category || '',
          category_id: data.category_id || '',
          tags: parseJson(data.tags, []),
          thumbnail: data.thumbnail,
          hero_image: data.hero_image,
          gallery: parseJson(data.gallery, []),
          tech_stack: parseJson(data.tech_stack, []),
          stats: parseJson(data.stats, {}),
          live_url: data.live_url,
          repo_url: data.repo_url,
          visibility: data.visibility || 'public',
          sort_order: data.sort_order || 0,
          updated_at: new Date().toISOString(),
        },
      }
    );
  };

  const deleteProject = async (id: string) => {
    const db = await connection();
    await db.collection('projects').deleteOne({ $or: [{ _id: id }, { slug: id }] });
  };

  const getCertificates = async () => {
    const db = await connection();
    return (await db.collection('certificates').find().sort({ sort_order: 1 }).toArray()).map((item: any) => ({
      ...item,
      id: item?.id ?? (item?._id?.toString?.() ?? item?._id),
    }));
  };

  const createCertificate = async (data: any) => {
    const db = await connection();
    const result = await db.collection('certificates').insertOne({
      _id: randomUUID(),
      title: data.title,
      year: data.year,
      image: data.image,
      sort_order: data.sort_order || 0,
    });
    return result.insertedId.toString();
  };

  const updateCertificate = async (id: string, data: any) => {
    const db = await connection();
    await db.collection('certificates').updateOne({ _id: id }, { $set: { title: data.title, year: data.year, image: data.image, sort_order: data.sort_order || 0 } });
  };

  const deleteCertificate = async (id: string) => {
    const db = await connection();
    await db.collection('certificates').deleteOne({ _id: id });
  };

  const getExperience = async () => {
    const db = await connection();
    return (await db.collection('experience').find().sort({ sort_order: 1, created_at: 1 }).toArray()).map(normalizeExperience);
  };

  const createExperience = async (data: any) => {
    const db = await connection();
    const record = {
      _id: randomUUID(),
      role: data.role || data.role_en || data.role_id || '',
      role_en: data.role_en || data.role || '',
      role_id: data.role_id || '',
      company: data.company || data.company_en || data.company_id || '',
      company_en: data.company_en || data.company || '',
      company_id: data.company_id || '',
      period: data.period || data.period_en || data.period_id || '',
      period_en: data.period_en || data.period || '',
      period_id: data.period_id || '',
      location: data.location || data.location_en || data.location_id || '',
      location_en: data.location_en || data.location || '',
      location_id: data.location_id || '',
      description: data.description || data.description_en || data.description_id || '',
      description_en: data.description_en || data.description || '',
      description_id: data.description_id || '',
      sort_order: data.sort_order || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const result = await db.collection('experience').insertOne(record);
    return result.insertedId.toString();
  };

  const updateExperience = async (id: string, data: any) => {
    const db = await connection();
    await db.collection('experience').updateOne(
      { _id: id },
      {
        $set: {
          role: data.role || data.role_en || data.role_id || '',
          role_en: data.role_en || data.role || '',
          role_id: data.role_id || '',
          company: data.company || data.company_en || data.company_id || '',
          company_en: data.company_en || data.company || '',
          company_id: data.company_id || '',
          period: data.period || data.period_en || data.period_id || '',
          period_en: data.period_en || data.period || '',
          period_id: data.period_id || '',
          location: data.location || data.location_en || data.location_id || '',
          location_en: data.location_en || data.location || '',
          location_id: data.location_id || '',
          description: data.description || data.description_en || data.description_id || '',
          description_en: data.description_en || data.description || '',
          description_id: data.description_id || '',
          sort_order: data.sort_order || 0,
          updated_at: new Date().toISOString(),
        },
      }
    );
  };

  const deleteExperience = async (id: string) => {
    const db = await connection();
    await db.collection('experience').deleteOne({ _id: id });
  };

  const getContacts = async () => {
    const db = await connection();
    return (await db.collection('contacts').find().sort({ created_at: -1 }).toArray()).map(normalizeContact);
  };

  const createContact = async (data: any) => {
    const db = await connection();
    await db.collection('contacts').insertOne({
      _id: randomUUID(),
      name: data.name,
      email: data.email,
      interest: data.interest,
      message: data.message,
      read: false,
      created_at: new Date().toISOString(),
    });
  };

  const markAllContactsRead = async () => {
    const db = await connection();
    await db.collection('contacts').updateMany({ read: false }, { $set: { read: true } });
  };

  const deleteContact = async (id: string) => {
    const db = await connection();
    await db.collection('contacts').deleteOne({ _id: id });
  };

  const countUnreadContacts = async () => {
    const db = await connection();
    return await db.collection('contacts').countDocuments({ read: false });
  };

  const getAdminUserByUsername = async (username: string) => {
    const db = await connection();
    return await db.collection('admin_users').findOne({ username });
  };

  const countProjects = async () => {
    const db = await connection();
    return await db.collection('projects').countDocuments();
  };

  const countCertificates = async () => {
    const db = await connection();
    return await db.collection('certificates').countDocuments();
  };

  // Initialize seed data asynchronously (fire and forget)
  ensureSeed().catch(err => {
    console.warn('MongoDB seed initialization in background failed (non-blocking):', err instanceof Error ? err.message : String(err));
  });

  return {
    type: 'mongodb' as const,
    getSettings,
    updateSettings,
    getProfile,
    updateProfile,
    getSections,
    saveSections,
    updateSectionById,
    getTechStack,
    createTechItem,
    updateTechItem,
    deleteTechItem,
    getProjects,
    getProjectByIdOrSlug,
    createProject,
    updateProject,
    deleteProject,
    getCertificates,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    getExperience,
    createExperience,
    updateExperience,
    deleteExperience,
    getContacts,
    createContact,
    markAllContactsRead,
    deleteContact,
    countUnreadContacts,
    getAdminUserByUsername,
    countProjects,
    countCertificates,
  };
});

const createSupabaseProvider = (() => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY must be defined for Supabase provider');
  }

  const client = globalThis.__supabaseClient ?? createSupabaseClient(url, key, { auth: { persistSession: false } });
  if (!globalThis.__supabaseClient) globalThis.__supabaseClient = client;

  async function ensureSuccess<T>(result: any): Promise<T> {
    if (result.error) {
      throw result.error;
    }
    return result.data as T;
  }

  const getSettings = async () => {
    const result = await client.from('settings').select('*');
    const rows = await ensureSuccess<any[]>(result);
    return rows.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), { theme_mode: 'dark', primary_color: '#c3c0ff' });
  };

  const updateSettings = async (settings: Record<string, string>) => {
    await ensureSuccess(
      client.from('settings').upsert(Object.entries(settings).map(([key, value]) => ({ key, value })))
    );
  };

  const ensureSeed = async () => {
    await client.from('settings').upsert([
      { key: 'theme_mode', value: 'dark' },
      { key: 'primary_color', value: '#c3c0ff' },
    ]);
    const adminCreds = getDefaultAdminCredentials();
    if (adminCreds.isConfigured) {
      const hash = bcrypt.hashSync(adminCreds.password, 10);
      await ensureSuccess(
        client.from('admin_users').upsert(
          [{ username: adminCreds.username, password_hash: hash }],
          { onConflict: 'username' }
        )
      );
    } else {
      console.warn('Default admin account is not configured. Set DEFAULT_ADMIN_USERNAME and DEFAULT_ADMIN_PASSWORD in .env');
    }
    const { data: profileData } = await client.from('profile').select('id').eq('id', 1).limit(1);
    if (!profileData || profileData.length === 0) {
      await client.from('profile').insert([
        {
          id: 1,
          name: 'Aditya',
          title: 'Senior Product Designer & Full-Stack Developer',
          bio: 'I am a senior product designer and full-stack developer dedicated to crafting intentional, high-performance interfaces that bridge the gap between human intuition and technical precision.',
          email: 'hello@executive.design',
          location: 'San Francisco, CA',
          years_experience: '8+',
          avatar: '/img/avatar.jpg',
        },
      ]);
    }
  };

  const getProfile = async () => {
    const { data } = await ensureSuccess<any[]>(client.from('profile').select('*').eq('id', 1).limit(1));
    return data?.[0] ?? null;
  };

  const updateProfile = async (data: any) => {
    await ensureSuccess(client.from('profile').upsert([{ id: 1, ...data, updated_at: new Date().toISOString() }]));
  };

  const getSections = async () => {
    const { data } = await ensureSuccess<any[]>(client.from('sections').select('*').order('sort_order', { ascending: true }));
    return reconcileSections(data);
  };

  const saveSections = async (sections: any[]) => {
    const reconciledSections = reconcileSections(sections);
    const existingCustom = await ensureSuccess<any[]>(
      client.from('sections').select('id').like('id', 'custom-builder-%')
    );
    const incomingCustom = new Set(
      reconciledSections.filter((item) => String(item.id).startsWith('custom-builder-')).map((item) => item.id)
    );
    await Promise.all(
      existingCustom.map((item) => {
        if (!incomingCustom.has(item.id)) {
          return ensureSuccess(client.from('sections').delete().eq('id', item.id));
        }
        return Promise.resolve();
      })
    );

    await ensureSuccess(
      client.from('sections').upsert(
        reconciledSections.map((item) => ({
          id: item.id,
          label: item.label,
          sort_order: item.sort_order,
          visible: item.visible ? 1 : 0,
          config: JSON.stringify(item.config || {}),
        }))
      )
    );
  };

  const updateSectionById = async (id: string, data: any) => {
    await ensureSuccess(
      client.from('sections').update({ label: data.label, visible: data.visible ? 1 : 0, config: JSON.stringify(data.config || {}) }).eq('id', id)
    );
  };

  const getTechStack = async () => {
    const { data } = await ensureSuccess<any[]>(client.from('tech_stack').select('*').order('sort_order', { ascending: true }));
    return data;
  };

  const createTechItem = async (data: any) => {
    const { data: inserted } = await ensureSuccess<any>(client.from('tech_stack').insert([{ name: data.name, icon: data.icon, sort_order: data.sort_order || 0 }]).select('id').single());
    return inserted?.id;
  };

  const updateTechItem = async (id: string, data: any) => {
    await ensureSuccess(client.from('tech_stack').update({ name: data.name, icon: data.icon, sort_order: data.sort_order || 0 }).eq('id', id));
  };

  const deleteTechItem = async (id: string) => {
    await ensureSuccess(client.from('tech_stack').delete().eq('id', id));
  };

  const getProjects = async (visibility?: string) => {
    const query = client.from('projects').select('*').order('sort_order', { ascending: true });
    if (visibility) query.eq('visibility', visibility);
    const { data } = await ensureSuccess<any[]>(query);
    return data.map(normalizeProject);
  };

  const getProjectByIdOrSlug = async (idOrSlug: string) => {
    const { data } = await ensureSuccess<any[]>(
      client.from('projects').select('*').or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`).limit(1)
    );
    return normalizeProject(data?.[0] ?? null);
  };

  const createProject = async (data: any) => {
    const project = {
      id: randomUUID(),
      title: data.title || data.title_en || data.title_id || '',
      title_en: data.title_en || data.title || '',
      title_id: data.title_id || '',
      slug: data.slug,
      description: data.description || data.description_en || data.description_id || '',
      description_en: data.description_en || data.description || '',
      description_id: data.description_id || '',
      long_description: data.long_description || data.long_description_en || data.long_description_id || '',
      long_description_en: data.long_description_en || data.long_description || '',
      long_description_id: data.long_description_id || '',
      category: data.category || data.category_en || data.category_id || '',
      category_en: data.category_en || data.category || '',
      category_id: data.category_id || '',
      tags: parseJson(data.tags, []),
      thumbnail: data.thumbnail,
      hero_image: data.hero_image,
      gallery: parseJson(data.gallery, []),
      tech_stack: parseJson(data.tech_stack, []),
      stats: parseJson(data.stats, {}),
      live_url: data.live_url,
      repo_url: data.repo_url,
      visibility: data.visibility || 'public',
      sort_order: data.sort_order || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await ensureSuccess(client.from('projects').insert([project]));
    return project.id;
  };

  const updateProject = async (id: string, data: any) => {
    await ensureSuccess(
      client.from('projects').update({
        title: data.title || data.title_en || data.title_id || '',
        title_en: data.title_en || data.title || '',
        title_id: data.title_id || '',
        slug: data.slug,
        description: data.description || data.description_en || data.description_id || '',
        description_en: data.description_en || data.description || '',
        description_id: data.description_id || '',
        long_description: data.long_description || data.long_description_en || data.long_description_id || '',
        long_description_en: data.long_description_en || data.long_description || '',
        long_description_id: data.long_description_id || '',
        category: data.category || data.category_en || data.category_id || '',
        category_en: data.category_en || data.category || '',
        category_id: data.category_id || '',
        tags: parseJson(data.tags, []),
        thumbnail: data.thumbnail,
        hero_image: data.hero_image,
        gallery: parseJson(data.gallery, []),
        tech_stack: parseJson(data.tech_stack, []),
        stats: parseJson(data.stats, {}),
        live_url: data.live_url,
        repo_url: data.repo_url,
        visibility: data.visibility || 'public',
        sort_order: data.sort_order || 0,
        updated_at: new Date().toISOString(),
      }).or(`id.eq.${id},slug.eq.${id}`)
    );
  };

  const deleteProject = async (id: string) => {
    await ensureSuccess(client.from('projects').delete().or(`id.eq.${id},slug.eq.${id}`));
  };

  const getCertificates = async () => {
    const { data } = await ensureSuccess<any[]>(client.from('certificates').select('*').order('sort_order', { ascending: true }));
    return data;
  };

  const createCertificate = async (data: any) => {
    const { data: inserted } = await ensureSuccess<any>(client.from('certificates').insert([{ title: data.title, year: data.year, image: data.image, sort_order: data.sort_order || 0 }]).select('id').single());
    return inserted?.id;
  };

  const updateCertificate = async (id: string, data: any) => {
    await ensureSuccess(client.from('certificates').update({ title: data.title, year: data.year, image: data.image, sort_order: data.sort_order || 0 }).eq('id', id));
  };

  const deleteCertificate = async (id: string) => {
    await ensureSuccess(client.from('certificates').delete().eq('id', id));
  };

  const getExperience = async () => {
    const { data } = await ensureSuccess<any[]>(client.from('experience').select('*').order('sort_order', { ascending: true }));
    return data.map(normalizeExperience);
  };

  const createExperience = async (data: any) => {
    const row = {
      id: randomUUID(),
      role: data.role || data.role_en || data.role_id || '',
      role_en: data.role_en || data.role || '',
      role_id: data.role_id || '',
      company: data.company || data.company_en || data.company_id || '',
      company_en: data.company_en || data.company || '',
      company_id: data.company_id || '',
      period: data.period || data.period_en || data.period_id || '',
      period_en: data.period_en || data.period || '',
      period_id: data.period_id || '',
      location: data.location || data.location_en || data.location_id || '',
      location_en: data.location_en || data.location || '',
      location_id: data.location_id || '',
      description: data.description || data.description_en || data.description_id || '',
      description_en: data.description_en || data.description || '',
      description_id: data.description_id || '',
      sort_order: data.sort_order || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await ensureSuccess(client.from('experience').insert([row]));
    return row.id;
  };

  const updateExperience = async (id: string, data: any) => {
    await ensureSuccess(
      client.from('experience').update({
        role: data.role || data.role_en || data.role_id || '',
        role_en: data.role_en || data.role || '',
        role_id: data.role_id || '',
        company: data.company || data.company_en || data.company_id || '',
        company_en: data.company_en || data.company || '',
        company_id: data.company_id || '',
        period: data.period || data.period_en || data.period_id || '',
        period_en: data.period_en || data.period || '',
        period_id: data.period_id || '',
        location: data.location || data.location_en || data.location_id || '',
        location_en: data.location_en || data.location || '',
        location_id: data.location_id || '',
        description: data.description || data.description_en || data.description_id || '',
        description_en: data.description_en || data.description || '',
        description_id: data.description_id || '',
        sort_order: data.sort_order || 0,
        updated_at: new Date().toISOString(),
      }).eq('id', id)
    );
  };

  const deleteExperience = async (id: string) => {
    await ensureSuccess(client.from('experience').delete().eq('id', id));
  };

  const getContacts = async () => {
    const { data } = await ensureSuccess<any[]>(client.from('contacts').select('*').order('created_at', { ascending: false }));
    return data.map(normalizeContact);
  };

  const createContact = async (data: any) => {
    await ensureSuccess(
      client.from('contacts').insert([
        {
          name: data.name,
          email: data.email,
          interest: data.interest,
          message: data.message,
          read: false,
          created_at: new Date().toISOString(),
        },
      ])
    );
  };

  const markAllContactsRead = async () => {
    await ensureSuccess(client.from('contacts').update({ read: true }).eq('read', false));
  };

  const deleteContact = async (id: string) => {
    await ensureSuccess(client.from('contacts').delete().eq('id', id));
  };

  const countUnreadContacts = async () => {
    const { data } = await ensureSuccess<any[]>(client.from('contacts').select('id', { count: 'exact', head: true }).eq('read', false));
    return data?.length ?? 0;
  };

  const getAdminUserByUsername = async (username: string) => {
    const { data } = await ensureSuccess<any[]>(client.from('admin_users').select('*').eq('username', username).limit(1));
    return data?.[0] ?? null;
  };

  const countProjects = async () => {
    const { count } = await client.from('projects').select('id', { count: 'exact', head: true });
    return count ?? 0;
  };

  const countCertificates = async () => {
    const { count } = await client.from('certificates').select('id', { count: 'exact', head: true });
    return count ?? 0;
  };

  // Initialize seed data asynchronously (fire and forget)
  ensureSeed().catch(err => {
    console.warn('Supabase seed initialization in background failed (non-blocking):', err instanceof Error ? err.message : String(err));
  });

  return {
    type: 'supabase' as const,
    getSettings,
    updateSettings,
    getProfile,
    updateProfile,
    getSections,
    saveSections,
    updateSectionById,
    getTechStack,
    createTechItem,
    updateTechItem,
    deleteTechItem,
    getProjects,
    getProjectByIdOrSlug,
    createProject,
    updateProject,
    deleteProject,
    getCertificates,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    getExperience,
    createExperience,
    updateExperience,
    deleteExperience,
    getContacts,
    createContact,
    markAllContactsRead,
    deleteContact,
    countUnreadContacts,
    getAdminUserByUsername,
    countProjects,
    countCertificates,
  };
});


const provider =
  providerName == 'mongodb'
    ? createMongoProvider()
    : providerName == 'supabase'
    ? createSupabaseProvider()
    : createSqliteProvider();

console.log(`🚀 Final database provider: ${providerName}`);
console.log(`🔗 Database provider name exported: ${providerName}`);

export const dbProviderName = providerName;
export const getSettings = async () => provider.getSettings();
export const updateSettings = async (settings: Record<string, string>) => provider.updateSettings(settings);
export const getProfile = async () => provider.getProfile();
export const updateProfile = async (data: any) => provider.updateProfile(data);
export const getSections = async () => provider.getSections();
export const saveSections = async (sections: any[]) => provider.saveSections(sections);
export const updateSectionById = async (id: string, data: any) => provider.updateSectionById(id, data);
export const getTechStack = async () => provider.getTechStack();
export const createTechItem = async (data: any) => provider.createTechItem(data);
export const updateTechItem = async (id: string, data: any) => provider.updateTechItem(id, data);
export const deleteTechItem = async (id: string) => provider.deleteTechItem(id);
export const getProjects = async (visibility?: string) => provider.getProjects(visibility);
export const getProjectByIdOrSlug = async (idOrSlug: string) => provider.getProjectByIdOrSlug(idOrSlug);
export const createProject = async (data: any) => provider.createProject(data);
export const updateProject = async (id: string, data: any) => provider.updateProject(id, data);
export const deleteProject = async (id: string) => provider.deleteProject(id);
export const getCertificates = async () => provider.getCertificates();
export const createCertificate = async (data: any) => provider.createCertificate(data);
export const updateCertificate = async (id: string, data: any) => provider.updateCertificate(id, data);
export const deleteCertificate = async (id: string) => provider.deleteCertificate(id);
export const getExperience = async () => provider.getExperience();
export const createExperience = async (data: any) => provider.createExperience(data);
export const updateExperience = async (id: string, data: any) => provider.updateExperience(id, data);
export const deleteExperience = async (id: string) => provider.deleteExperience(id);
export const getContacts = async () => provider.getContacts();
export const createContact = async (data: any) => provider.createContact(data);
export const markAllContactsRead = async () => provider.markAllContactsRead();
export const deleteContact = async (id: string) => provider.deleteContact(id);
export const countUnreadContacts = async () => provider.countUnreadContacts();
export const getAdminUserByUsername = async (username: string) => provider.getAdminUserByUsername(username);
export const countProjects = async () => provider.countProjects();
export const countCertificates = async () => provider.countCertificates();
export const getUnreadCount = async () => provider.countUnreadContacts();

const db = {
  type: provider.type,
  getSettings,
  updateSettings,
  getProfile,
  updateProfile,
  getSections,
  saveSections,
  updateSectionById,
  getTechStack,
  createTechItem,
  updateTechItem,
  deleteTechItem,
  getProjects,
  getProjectByIdOrSlug,
  createProject,
  updateProject,
  deleteProject,
  getCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience,
  getContacts,
  createContact,
  markAllContactsRead,
  deleteContact,
  countUnreadContacts,
  getAdminUserByUsername,
  countProjects,
  countCertificates,
  getUnreadCount,
};

export default db;
