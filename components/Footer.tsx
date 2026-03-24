import { Facebook, MapPin, ArrowUpRight, Instagram } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";
import Image from "next/image";

export default function Footer() {
  const storeConfig = useConfig();
  const loading = !storeConfig;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-shopici-black text-white relative overflow-hidden">
      {/* 1. The Brand Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1 flex">
        <div className="h-full w-1/3 bg-shopici-blue opacity-60" />
        <div className="h-full w-1/12 bg-shopici-coral opacity-60" />
        <div className="h-full flex-1 bg-white/5" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-12">

        {/* 2. Top Section: Large Editorial Typography */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-16 mb-20 md:mb-32">
          <div className="max-w-xl space-y-8 md:space-y-10">
            <div className="flex items-center gap-4 md:gap-6">
              {loading ? (
                <div className="w-10 h-10 bg-white/5 animate-pulse rounded-full" />
              ) : storeConfig.logo && (
                <Image
                  src={storeConfig.logo}
                  alt={`${storeConfig.name} Logo`}
                  width={32}
                  height={32}
                  className="object-contain brightness-0 invert opacity-80 md:w-10 md:h-10"
                  unoptimized
                />
              )}
              <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none">
                {loading ? "..." : storeConfig.name}
              </h3>
            </div>

            <p className="text-lg md:text-2xl font-medium leading-snug tracking-tight text-white/70">
              L'excellence du shopping <span className="italic font-black text-white">digital</span> au Cameroun. <br />
              <span className="text-white/30 text-[10px] md:text-lg uppercase tracking-widest font-bold block mt-2">Sourcing premium • Livraison sécurisée</span>
            </p>
          </div>

          <div className="w-full lg:w-auto lg:text-right border-l-2 lg:border-l-0 lg:border-r-2 border-shopici-coral/30 pl-6 lg:pl-0 lg:pr-8 py-2 md:py-4">
            <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-shopici-blue mb-2 md:mb-4">Conciergerie</h4>
            <a
              href={`https://wa.me/${storeConfig?.contact.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center lg:justify-end gap-4 md:gap-6 text-2xl md:text-5xl font-black tracking-tighter hover:text-shopici-coral transition-colors duration-500"
            >
              {loading ? "..." : storeConfig.contact.phone}
              <ArrowUpRight className="w-5 h-5 md:w-8 md:h-8 text-white/10 group-hover:text-shopici-coral group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </a>
          </div>
        </div>

        {/* 3. The Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 md:gap-24 border-t border-white/5 pt-16 pb-16 md:pb-20">
          <FooterColumn
            title="Catalogue"
            links={[
              { label: "Nos Produits", href: "/products" },
              { label: "Nouveautés", href: "/products?filter=new" },
              { label: "Promotions", href: "/products?filter=sale" }
            ]}
          />
          <FooterColumn
            title="La Maison"
            links={[
              { label: "À Propos", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "Nos Boutiques", href: "/about#locations" }
            ]}
          />
          <FooterColumn
            title="Assistance"
            links={[
              { label: "Suivi Commande", href: "/shipping" },
              { label: "Livraison", href: "/shipping#delivery" },
              { label: "Retours", href: "/shipping#returns" }
            ]}
          />

          <div className="col-span-2 md:col-span-1 space-y-6 md:space-y-8">
            <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Siège Social</h4>
            <div className="flex items-start gap-3 md:gap-4 text-xs md:text-sm font-bold uppercase tracking-tight text-white/50 leading-relaxed">
              <MapPin className="w-4 h-4 text-shopici-blue shrink-0 mt-0.5" />
              <span>
                {loading ? "Chargement..." : storeConfig.contact.address}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Bottom Bar: Mobile-Optimized Legal & Socials */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
              © {currentYear} {storeConfig?.name}
            </p>
            <div className="flex gap-4 md:gap-6">
              <a href="/terms" className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-shopici-coral transition-colors">Terms</a>
              <a href="/privacy" className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-shopici-coral transition-colors">Privacy</a>
              <a href="/cookies" className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-shopici-coral transition-colors">Cookies</a>
            </div>
          </div>

          <div className="flex gap-6">
            {!loading && (
              <a href={storeConfig.social.facebook} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            )}
            <Instagram className="w-5 h-5 text-white/20" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="space-y-6 md:space-y-8">
      <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-white/20">{title}</h4>
      <ul className="space-y-3 md:space-y-4">
        {links.map((item) => (
          <li key={item.label}>
            <a href={item.href} className="text-[11px] md:text-sm font-bold uppercase tracking-tight text-white/60 hover:text-shopici-blue hover:pl-2 transition-all duration-300">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}