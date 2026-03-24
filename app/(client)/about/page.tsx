"use client";

import { Heart, Truck, ShieldCheck, Users } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";

export default function AboutPage() {
  const storeConfig = useConfig();
  const loading = !storeConfig;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-shopici-black to-shopici-charcoal text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {loading ? (
            <>
              <div className="h-12 w-72 bg-white/20 animate-pulse rounded-lg mx-auto mb-6" />
              <div className="h-5 w-[480px] max-w-full bg-white/10 animate-pulse rounded mx-auto mb-2" />
              <div className="h-5 w-64 bg-white/10 animate-pulse rounded mx-auto" />
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                À propos de {storeConfig.name}
              </h1>
              <p className="text-lg text-shopici-gray max-w-3xl mx-auto">
                Une plateforme pensée pour simplifier vos achats en ligne, avec
                un service fiable, transparent et proche de vous.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
        {/* Who we are */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-shopici-black mb-4">
              Qui sommes-nous ?
            </h2>
            {loading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-4/6" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-full mt-4" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
              </div>
            ) : (
              <>
                <p className="text-shopici-charcoal mb-4 leading-relaxed">
                  <strong>{storeConfig.name}</strong> est une boutique en ligne
                  basée à {storeConfig.contact.address}, créée avec une idée
                  simple : rendre le e-commerce plus accessible, plus clair et
                  plus fiable.
                </p>
                <p className="text-shopici-charcoal leading-relaxed">
                  Nous sélectionnons des produits utiles et de qualité, et nous
                  accompagnons chaque client depuis la commande jusqu'à la
                  livraison.
                </p>
              </>
            )}
          </div>

          <div className="bg-gradient-to-br from-shopici-blue/10 to-shopici-coral/10 rounded-2xl p-8">
            <p className="text-shopici-black font-semibold text-lg mb-2">
              Notre objectif :
            </p>
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-300/50 animate-pulse rounded w-full" />
                <div className="h-4 bg-gray-300/50 animate-pulse rounded w-4/5" />
                <div className="h-4 bg-gray-300/50 animate-pulse rounded w-3/5" />
              </div>
            ) : (
              <p className="text-shopici-charcoal">{storeConfig.objective}</p>
            )}
          </div>
        </section>

        {/* Values — static content, no skeleton needed */}
        <section>
          <h2 className="text-3xl font-bold text-shopici-black text-center mb-12">
            Nos valeurs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <ValueCard
              icon={<ShieldCheck />}
              title="Confiance"
              description="Des informations claires, des commandes suivies et un service honnête."
            />
            <ValueCard
              icon={<Truck />}
              title="Fiabilité"
              description="Chaque commande est préparée et livrée avec sérieux."
            />
            <ValueCard
              icon={<Users />}
              title="Proximité"
              description="Une équipe à l'écoute, proche de ses clients."
            />
            <ValueCard
              icon={<Heart />}
              title="Engagement"
              description="Nous améliorons continuellement nos services pour vous."
            />
          </div>
        </section>

        {/* Why choose us */}
        <section className="bg-background border border-shopici-gray/30 rounded-2xl p-10">
          {loading ? (
            <div className="h-9 w-80 bg-gray-200 animate-pulse rounded mb-6" />
          ) : (
            <h2 className="text-3xl font-bold text-shopici-black mb-6">
              Pourquoi choisir {storeConfig.name} ?
            </h2>
          )}
          <ul className="space-y-3 text-shopici-charcoal">
            <li>✔ Suivi de commande clair et en temps réel</li>
            <li>✔ Produits sélectionnés avec soin</li>
            <li>✔ Livraison fiable</li>
            <li>✔ Service client réactif</li>
          </ul>
        </section>

        {/* Closing */}
        <section className="text-center">
          {loading ? (
            <>
              <div className="h-8 w-64 bg-gray-200 animate-pulse rounded mx-auto mb-4" />
              <div className="h-4 w-96 max-w-full bg-gray-200 animate-pulse rounded mx-auto mb-2" />
              <div className="h-4 w-72 bg-gray-200 animate-pulse rounded mx-auto" />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-shopici-black mb-4">
                {storeConfig.name}, plus qu'une boutique
              </h2>
              <p className="text-shopici-charcoal max-w-2xl mx-auto">
                Nous construisons une plateforme de confiance, pensée pour vous
                accompagner au quotidien.
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-background border border-shopici-gray/30 rounded-xl p-6 text-center hover:shadow-lg transition-all">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-shopici-blue/10 flex items-center justify-center text-shopici-blue">
        {icon}
      </div>
      <h3 className="font-semibold text-shopici-black mb-2">{title}</h3>
      <p className="text-sm text-shopici-charcoal">{description}</p>
    </div>
  );
}