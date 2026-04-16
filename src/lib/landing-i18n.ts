'use client';

import { useEffect, useMemo, useState } from 'react';

export type LandingLang = 'en' | 'id';

export const LANDING_LANG_KEY = 'landing-lang';
export const LANDING_LANG_EVENT = 'landing-lang-change';

type LandingDictionary = {
  nav: {
    about: string;
    portfolio: string;
    projects: string;
    contact: string;
    hireMe: string;
    navigation: string;
    language: string;
    english: string;
    bahasa: string;
  };
  hero: {
    available: string;
    title: string;
    fallbackBio: string;
    cta: string;
    expert: string;
    experience: string;
  };
  tech: {
    title: string;
    desc: string;
    empty: string;
  };
  projects: {
    title: string;
    empty: string;
  };
  certs: {
    title: string;
    desc: string;
    downloadResume: string;
    dateHidden: string;
    empty: string;
  };
  contact: {
    available: string;
    title: string;
    subtitle: string;
    name: string;
    email: string;
    interest: string;
    interestOptions: string[];
    message: string;
    messagePlaceholder: string;
    send: string;
    sending: string;
    success: string;
    error: string;
  };
  footer: {
    tagline: string;
    copyright: string;
  };
  projectDetail: {
    allProjects: string;
    portfolio: string;
    project: string;
    noDetail: string;
    launch: string;
    repo: string;
    technologies: string;
  };
  floating: {
    contact: string;
  };
};

type AnyRecord = Record<string, unknown>;

const ID_SUFFIXES = ['id', 'idn', 'indo', 'indonesia', 'bahasa'];
const EN_SUFFIXES = ['en', 'eng', 'english'];

const dictionary: Record<LandingLang, LandingDictionary> = {
  en: {
    nav: {
      about: 'About',
      portfolio: 'Portfolio',
      projects: 'Projects',
      contact: 'Contact',
      hireMe: 'Hire Me',
      navigation: 'Navigation',
      language: 'Language',
      english: 'English',
      bahasa: 'Bahasa',
    },
    hero: {
      available: 'Available for specialized projects',
      title: 'Full Stack Web Developer.',
      fallbackBio:
        'I am a senior product designer and full-stack developer dedicated to crafting intentional, high-performance interfaces that bridge the gap between human intuition and technical precision.',
      cta: 'View My Work',
      expert: 'Top Rated Expert',
      experience: 'Experience',
    },
    tech: {
      title: 'Technological Ecosystem',
      desc: 'My toolkit is curated for performance, scalability, and aesthetic excellence.',
      empty: 'No tech stack items added yet.',
    },
    projects: {
      title: 'Selected Works',
      empty: 'No projects added yet. Admin panel is ready for CRUD.',
    },
    certs: {
      title: 'Accredited Precision',
      desc: 'Continuous learning is the cornerstone of my professional philosophy. Here are my key specializations and industry certifications.',
      downloadResume: 'Download Resume',
      dateHidden: 'Date Hidden',
      empty: 'No certifications listed.',
    },
    contact: {
      available: 'Available Now',
      title: "Let's build something extraordinary together.",
      subtitle: 'Currently accepting new commissions. Reach out for a free consultation or just to say hi.',
      name: 'Full Name',
      email: 'Email Address',
      interest: 'Project Interest',
      interestOptions: ['Product Design', 'Web Development', 'Brand Strategy', 'Consultation'],
      message: 'Message',
      messagePlaceholder: 'Tell me about your vision...',
      send: 'Send Message',
      sending: 'Sending...',
      success: 'Message sent successfully.',
      error: 'Error sending message. Please try again.',
    },
    footer: {
      tagline: 'FullStack Web Developer',
      copyright: 'Portfolio. Designed with precision.',
    },
    projectDetail: {
      allProjects: 'All Projects',
      portfolio: 'Portfolio',
      project: 'Project',
      noDetail: 'No detailed description available.',
      launch: 'Launch Live Demo',
      repo: 'View Repository',
      technologies: 'Technologies Used',
    },
    floating: {
      contact: 'Contact',
    },
  },
  id: {
    nav: {
      about: 'Tentang',
      portfolio: 'Portofolio',
      projects: 'Proyek',
      contact: 'Kontak',
      hireMe: 'Hire Me',
      navigation: 'Navigasi',
      language: 'Bahasa',
      english: 'English',
      bahasa: 'Bahasa',
    },
    hero: {
      available: 'Tersedia untuk proyek khusus',
      title: 'Developer Web Full Stack.',
      fallbackBio:
        'Saya adalah product designer senior sekaligus full-stack developer yang berfokus pada antarmuka berkinerja tinggi dan pengalaman pengguna yang presisi.',
      cta: 'Lihat Karya',
      expert: 'Expert Terbaik',
      experience: 'Pengalaman',
    },
    tech: {
      title: 'Ekosistem Teknologi',
      desc: 'Toolkit saya dikurasi untuk performa, skalabilitas, dan kualitas estetika.',
      empty: 'Belum ada item tech stack.',
    },
    projects: {
      title: 'Karya Pilihan',
      empty: 'Belum ada proyek. Panel admin sudah siap untuk CRUD.',
    },
    certs: {
      title: 'Akurasi Tersertifikasi',
      desc: 'Belajar berkelanjutan adalah fondasi filosofi profesional saya. Berikut spesialisasi utama dan sertifikasi saya.',
      downloadResume: 'Unduh CV',
      dateHidden: 'Tanggal Disembunyikan',
      empty: 'Belum ada sertifikasi.',
    },
    contact: {
      available: 'Tersedia Sekarang',
      title: 'Mari bangun sesuatu yang luar biasa bersama.',
      subtitle: 'Saat ini saya menerima proyek baru. Hubungi saya untuk konsultasi gratis atau sekadar menyapa.',
      name: 'Nama Lengkap',
      email: 'Alamat Email',
      interest: 'Minat Proyek',
      interestOptions: ['Desain Produk', 'Pengembangan Web', 'Strategi Brand', 'Konsultasi'],
      message: 'Pesan',
      messagePlaceholder: 'Ceritakan visi Anda...',
      send: 'Kirim Pesan',
      sending: 'Mengirim...',
      success: 'Pesan berhasil dikirim.',
      error: 'Gagal mengirim pesan. Coba lagi.',
    },
    footer: {
      tagline: 'Developer Web FullStack',
      copyright: 'Portofolio. Dirancang dengan presisi.',
    },
    projectDetail: {
      allProjects: 'Semua Proyek',
      portfolio: 'Portofolio',
      project: 'Proyek',
      noDetail: 'Belum ada deskripsi detail.',
      launch: 'Buka Demo',
      repo: 'Lihat Repositori',
      technologies: 'Teknologi yang Digunakan',
    },
    floating: {
      contact: 'Kontak',
    },
  },
};

const readString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }
  if (typeof value === 'number') return String(value);
  return null;
};

const readLocalizedObject = (value: unknown, lang: LandingLang): string | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as AnyRecord;
  const preferredKey = lang === 'id' ? 'id' : 'en';
  const fallbackKey = lang === 'id' ? 'en' : 'id';
  return readString(record[preferredKey]) || readString(record[fallbackKey]);
};

const resolveBySuffix = (record: AnyRecord, baseKey: string, suffixes: string[]): string | null => {
  for (const suffix of suffixes) {
    const value = readString(record[`${baseKey}_${suffix}`]);
    if (value) return value;
  }
  return null;
};

export const resolveLocalizedField = (
  record: AnyRecord | null | undefined,
  baseKey: string,
  lang: LandingLang,
  fallback = ''
): string => {
  if (!record) return fallback;

  const baseValue = record[baseKey];
  const localizedFromBase =
    readLocalizedObject(baseValue, lang) ||
    resolveBySuffix(record, baseKey, lang === 'id' ? ID_SUFFIXES : EN_SUFFIXES) ||
    readString(baseValue);

  if (localizedFromBase) return localizedFromBase;

  return resolveBySuffix(record, baseKey, lang === 'id' ? EN_SUFFIXES : ID_SUFFIXES) || fallback;
};

export const resolveLocalizedArrayField = (
  record: AnyRecord | null | undefined,
  baseKey: string,
  lang: LandingLang
): string[] => {
  if (!record) return [];

  const baseValue =
    record[baseKey] ??
    record[`${baseKey}_${lang}`] ??
    record[`${baseKey}_${lang === 'id' ? 'idn' : 'eng'}`] ??
    record[`${baseKey}_${lang === 'id' ? 'indo' : 'english'}`];

  if (!Array.isArray(baseValue)) return [];

  return baseValue
    .map((entry) => {
      if (typeof entry === 'string') return entry;
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        const objectEntry = entry as AnyRecord;
        return readLocalizedObject(objectEntry, lang) || readString(objectEntry.value) || '';
      }
      return '';
    })
    .filter((entry): entry is string => Boolean(entry));
};

export const getStoredLandingLang = (): LandingLang => {
  if (typeof window === 'undefined') return 'en';
  const value = window.localStorage.getItem(LANDING_LANG_KEY);
  return value === 'id' ? 'id' : 'en';
};

export const setStoredLandingLang = (lang: LandingLang) => {
  window.localStorage.setItem(LANDING_LANG_KEY, lang);
  window.dispatchEvent(new CustomEvent(LANDING_LANG_EVENT, { detail: lang }));
};

export const useLandingI18n = () => {
  const [lang, setLang] = useState<LandingLang>(() => getStoredLandingLang());

  useEffect(() => {
    const onLangChange = (event: Event) => {
      const customEvent = event as CustomEvent<LandingLang>;
      if (customEvent.detail === 'en' || customEvent.detail === 'id') {
        setLang(customEvent.detail);
      }
    };

    window.addEventListener(LANDING_LANG_EVENT, onLangChange);
    return () => window.removeEventListener(LANDING_LANG_EVENT, onLangChange);
  }, []);

  const text = useMemo(() => dictionary[lang], [lang]);

  const changeLang = (nextLang: LandingLang) => {
    setLang(nextLang);
    setStoredLandingLang(nextLang);
  };

  return { lang, text, changeLang, setLang };
};
