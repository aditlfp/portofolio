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

const providerName = (process.env.DB_PROVIDER || 'sqlite').toLowerCase() as ProviderName;

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
  return {
    ...project,
    id: project?.id ?? (project?._id?.toString?.() ?? project?._id),
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

const sqliteProvider = (() => {
  const dbPath = path.join(process.cwd(), 'database.sqlite');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

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

    const adminCount = db.prepare('SELECT count(*) as count FROM admin_users').get() as { count: number };
    if (adminCount.count === 0) {
      const hash = bcrypt.hashSync('admin123', 10);
      db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run('aditya', hash);
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
      const sections = [
        { id: 'hero', label: 'Hero', sort_order: 0 },
        { id: 'tech-stack', label: 'Tech Stack', sort_order: 1 },
        { id: 'projects', label: 'Projects', sort_order: 2 },
        { id: 'certificates', label: 'Certificates', sort_order: 3 },
        { id: 'contact', label: 'Contact', sort_order: 4 }
      ];
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

  const getSections = async () => db.prepare('SELECT * FROM sections ORDER BY sort_order ASC').all().map(normalizeSection);
  const saveSections = async (sections: any[]) => {
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
    const incoming = new Set(sections.map((item) => item.id));
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
    transaction(sections);
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
})();

const mongoProvider = (() => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.MONGODB_DB || 'portfolio';
  const client = globalThis.__mongoClient ?? new MongoClient(uri);
  if (!globalThis.__mongoClient) globalThis.__mongoClient = client;

  async function connection(): Promise<any> {
    await client.connect();
    return client.db(dbName);
  }

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
    const db = await connection();
    const hash = bcrypt.hashSync('admin123', 10);

    await Promise.all([
      db.collection('settings').updateOne(
        { _id: 'theme_mode' },
        { $setOnInsert: { key: 'theme_mode', value: 'dark' } },
        { upsert: true }
      ),
      db.collection('settings').updateOne(
        { _id: 'primary_color' },
        { $setOnInsert: { key: 'primary_color', value: '#c3c0ff' } },
        { upsert: true }
      ),
      db.collection('admin_users').updateOne(
        { _id: 'admin:aditya' },
        { $setOnInsert: { id: 1, username: 'aditya', password_hash: hash } },
        { upsert: true }
      ),
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
      ),
    ]);

    const baseSections = [
      { _id: 'hero', label: 'Hero', sort_order: 0, visible: 1, config: '{}' },
      { _id: 'tech-stack', label: 'Tech Stack', sort_order: 1, visible: 1, config: '{}' },
      { _id: 'projects', label: 'Projects', sort_order: 2, visible: 1, config: '{}' },
      { _id: 'certificates', label: 'Certificates', sort_order: 3, visible: 1, config: '{}' },
      { _id: 'contact', label: 'Contact', sort_order: 4, visible: 1, config: '{}' },
    ];

    await db.collection('sections').bulkWrite(
      baseSections.map((section) => ({
        updateOne: {
          filter: { _id: section._id },
          update: { $setOnInsert: section },
          upsert: true,
        },
      }))
    );
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
    return (await db.collection('sections').find().sort({ sort_order: 1 }).toArray()).map(normalizeSection);
  };

  const saveSections = async (sections: any[]) => {
    const db = await connection();
    const collection = db.collection('sections');
    const existingCustom = await collection.find({ _id: { $regex: '^custom-builder-' } }).project({ _id: 1 }).toArray();
    const incomingIds = new Set(sections.map((item) => item.id));
    await Promise.all(
      existingCustom.map((item) => {
        if (!incomingIds.has(item._id)) {
          return collection.deleteOne({ _id: item._id });
        }
        return Promise.resolve();
      })
    );
    await Promise.all(
      sections.map((item) =>
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
    return await db
      .collection('projects')
      .findOne({ $or: [{ _id: idOrSlug }, { slug: idOrSlug }] });
  };

  const createProject = async (data: any) => {
    const db = await connection();
    const record = {
      _id: data.id || randomUUID(),
      title: data.title,
      slug: data.slug,
      description: data.description,
      long_description: data.long_description,
      category: data.category,
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
          title: data.title,
          slug: data.slug,
          description: data.description,
          long_description: data.long_description,
          category: data.category,
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

  ensureSeed();

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
    getContacts,
    createContact,
    markAllContactsRead,
    deleteContact,
    countUnreadContacts,
    getAdminUserByUsername,
    countProjects,
    countCertificates,
  };
})();

const supabaseProvider = (() => {
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
    const { data: adminUsers } = await client.from('admin_users').select('id').limit(1);
    if (!adminUsers || adminUsers.length === 0) {
      const hash = bcrypt.hashSync('admin123', 10);
      await client.from('admin_users').insert([{ id: 1, username: 'aditya', password_hash: hash }]);
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
    return data.map(normalizeSection);
  };

  const saveSections = async (sections: any[]) => {
    await ensureSuccess(
      client.from('sections').upsert(
        sections.map((item) => ({
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
    return data?.[0] ?? null;
  };

  const createProject = async (data: any) => {
    const project = {
      id: randomUUID(),
      title: data.title,
      slug: data.slug,
      description: data.description,
      long_description: data.long_description,
      category: data.category,
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
        title: data.title,
        slug: data.slug,
        description: data.description,
        long_description: data.long_description,
        category: data.category,
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

  ensureSeed();

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
    getContacts,
    createContact,
    markAllContactsRead,
    deleteContact,
    countUnreadContacts,
    getAdminUserByUsername,
    countProjects,
    countCertificates,
  };
})();

const provider = providerName === 'mongodb' ? mongoProvider : providerName === 'supabase' ? supabaseProvider : sqliteProvider;

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
