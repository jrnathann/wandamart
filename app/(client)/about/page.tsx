"use client";

import { Heart, Truck, ShieldCheck, Users, Check } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";

export default function AboutPage() {
  const storeConfig = useConfig();
  const loading = !storeConfig;

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Atelier Header: Editorial Style */}
      <div className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-6 bg-white overflow-hidden">
        {/* The "Brand Accent" Line */}
        <div className="absolute top-0 left-0 w-full h-1 flex">
          <div className="h-full w-1/3 bg-shopici-blue opacity-80" />
          <div className="h-full w-1/12 bg-shopici-coral opacity-80" />
          <div className="h-full flex-1 bg-shopici-gray/5" />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-shopici-blue">
              L'Histoire Shopici
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-shopici-black uppercase tracking-tighter leading-[0.9]">
              Notre <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-shopici-black to-shopici-charcoal/40">
                Vision
              </span>
            </h1>
          </div>

          <div className="md:text-right space-y-2 border-l-2 md:border-l-0 md:border-r-2 border-shopici-coral/30 pl-6 md:pl-0 md:pr-6 py-2">
            <p className="text-lg sm:text-xl font-medium text-shopici-black tracking-tight leading-snug">
              Simplifier le commerce <span className="font-black italic">digital</span> au Cameroun.
            </p>
            <p className="text-xs sm:text-sm font-bold text-shopici-charcoal/40 uppercase tracking-[0.1em]">
              Transparence • Fiabilité • Proximité
            </p>
          </div>
        </div>
      </div>

      {/* 2. Content Sections */}
      <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 space-y-32">
        
        {/* Who we are - Asymmetric Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-block border-b-2 border-shopici-coral pb-2">
              <h2 className="text-2xl font-black text-shopici-black uppercase tracking-tight">Qui sommes-nous ?</h2>
            </div>
            <div className="space-y-6 text-base sm:text-lg text-shopici-charcoal leading-relaxed font-medium">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-shopici-gray/10 w-full" />
                  <div className="h-4 bg-shopici-gray/10 w-5/6" />
                  <div className="h-4 bg-shopici-gray/10 w-4/6" />
                </div>
              ) : (
                <>
                  <p>
                    <span className="font-black text-shopici-black">{storeConfig.name}</span> est une enseigne digitale 
                    basée à {storeConfig.contact.address}, née d'une ambition claire : redéfinir les standards 
                    de l'achat en ligne pour le public camerounais.
                  </p>
                  <p>
                    Nous ne nous contentons pas de vendre ; nous sélectionnons des pièces qui apportent 
                    une valeur réelle, en garantissant un suivi millimétré de la commande à la main propre.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 bg-shopici-gray/5 p-8 sm:p-12 border border-shopici-gray/10 relative">
             <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-shopici-blue/20" />
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-shopici-blue mb-6">Notre Engagement</h3>
             <p className="text-xl sm:text-2xl font-black text-shopici-black leading-tight uppercase tracking-tighter italic">
               "{loading ? "Chargement de la mission..." : storeConfig.objective}"
             </p>
          </div>
        </section>

        {/* Values - Minimalist Icon Grid */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-shopici-black uppercase tracking-tight">Nos Piliers</h2>
            <div className="h-1 w-12 bg-shopici-coral mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-shopici-gray/10 border border-shopici-gray/10">
            <ValueCard 
              icon={<ShieldCheck className="w-5 h-5" />} 
              title="Intégrité" 
              desc="Honnêteté totale sur l'origine et la qualité de nos produits." 
            />
            <ValueCard 
              icon={<Truck className="w-5 h-5" />} 
              title="Rigueur" 
              desc="Logistique précise pour une livraison sans compromis." 
            />
            <ValueCard 
              icon={<Users className="w-5 h-5" />} 
              title="Écoute" 
              desc="Un support humain, réactif et dédié à votre satisfaction." 
            />
            <ValueCard 
              icon={<Heart className="w-5 h-5" />} 
              title="Passion" 
              desc="L'amour du détail dans chaque colis que nous préparons." 
            />
          </div>
        </section>

        {/* Why choose us - Checklist Style */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-shopici-black text-white p-10 sm:p-20 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-shopici-blue via-shopici-coral to-transparent" />
          <div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter leading-none mb-6">
              L'Avantage <br /> {loading ? "Shopici" : storeConfig.name}
            </h2>
            <p className="text-shopici-gray text-sm uppercase tracking-widest font-bold">Pourquoi nous faire confiance ?</p>
          </div>
          <ul className="space-y-6">
            {[
              "Suivi de commande en temps réel via WhatsApp",
              "Sélection de produits Premium certifiés",
              "Logistique locale maîtrisée au Cameroun",
              "Service après-vente personnalisé"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 group">
                <div className="w-6 h-6 rounded-full border border-shopici-coral flex items-center justify-center group-hover:bg-shopici-coral transition-colors">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm sm:text-base font-bold uppercase tracking-tight">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white p-10 space-y-6 hover:bg-shopici-gray/5 transition-colors">
      <div className="text-shopici-blue">{icon}</div>
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-shopici-black">{title}</h3>
        <p className="text-sm text-shopici-charcoal/70 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}