const CURRENT_YEAR = new Date().getFullYear();

export default function Footer({ profile }: { profile: any }) {
  return (
    <footer className="bg-[#131313] border-t border-slate-800/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-7xl mx-auto gap-8">
        <div className="space-y-2 text-center md:text-left">
          <div className="text-primary font-headline font-bold tracking-[0.2em] uppercase text-xs">The Digital Atelier</div>
          <p className="text-slate-600 text-xs uppercase tracking-[0.05em] font-body">
            &copy; {CURRENT_YEAR} {profile?.name || 'Executive'} Portfolio. Designed with precision.
          </p>
        </div>

        <div className="flex gap-8">
          <a href="#" className="text-slate-600 hover:text-primary transition-colors text-xs uppercase tracking-[0.05em] font-body underline-offset-4 hover:underline">LinkedIn</a>
          <a href="#" className="text-slate-600 hover:text-primary transition-colors text-xs uppercase tracking-[0.05em] font-body underline-offset-4 hover:underline">GitHub</a>
          <a href="#" className="text-slate-600 hover:text-primary transition-colors text-xs uppercase tracking-[0.05em] font-body underline-offset-4 hover:underline">Dribbble</a>
        </div>
      </div>
    </footer>
  );
}
