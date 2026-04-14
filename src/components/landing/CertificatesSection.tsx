import Image from 'next/image';
import AppIcon from '@/components/ui/AppIcon';

export default function CertificatesSection({ certificates }: { certificates: any[] }) {
  return (
    <section className="bg-surface-container-low py-14 sm:py-24" id="certificates">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="editorial-grid gap-12">
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <h2 className="text-3xl font-headline font-bold tracking-tight">Accredited <span className="text-primary">Precision</span></h2>
            <p className="text-on-surface-variant leading-relaxed">
              Continuous learning is the cornerstone of my professional philosophy. Here are my key specializations and industry certifications.
            </p>
            <button className="flex items-center gap-2 text-primary font-bold group">
              Download Resume
              <AppIcon name="download" className="text-sm transition-transform duration-300 group-hover:translate-y-1" />
            </button>
          </div>

          <div className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="group cursor-pointer items-start gap-4 rounded-2xl bg-surface p-6 ring-1 ring-outline-variant/10 transition-all duration-300 hover:-translate-y-1 hover:ring-primary/30"
              >
                <div className="flex gap-4">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    {cert.image ? (
                      <Image src={cert.image} alt={cert.title} fill className="object-contain" sizes="48px" />
                    ) : (
                      <div className="p-3 bg-primary/10 rounded-xl w-full h-full flex items-center justify-center">
                        <AppIcon name="certificate" className="text-primary" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-on-surface transition-colors duration-300 group-hover:text-primary">
                      {cert.title}
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-1 uppercase tracking-widest font-label">
                      {cert.year || 'Date Hidden'}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {certificates.length === 0 && (
              <div className="col-span-full py-12 px-6 border border-dashed border-outline-variant/20 rounded-2xl text-center text-on-surface-variant italic">
                No certifications listed.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
