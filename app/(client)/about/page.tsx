import { Heart, Truck, ShieldCheck, Users } from "lucide-react";
import { storeConfig } from "@/data/configData";
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-shopici-black to-shopici-charcoal text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            À propos de {storeConfig.name}
          </h1>
          <p className="text-lg text-shopici-gray max-w-3xl mx-auto">
            Une plateforme pensée pour simplifier vos achats en ligne, avec un
            service fiable, transparent et proche de vous.
          </p>
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
            <p className="text-shopici-charcoal mb-4 leading-relaxed">
              <strong>{storeConfig.name}</strong> est une boutique en ligne basée à {storeConfig.contact.address}, créée avec une idée simple : rendre le e-commerce plus
              accessible, plus clair et plus fiable.
            </p>
            <p className="text-shopici-charcoal leading-relaxed">
              Nous sélectionnons des produits utiles et de qualité, et nous
              accompagnons chaque client depuis la commande jusqu’à la
              livraison.
            </p>
          </div>

          <div className="bg-gradient-to-br from-shopici-blue/10 to-shopici-coral/10 rounded-2xl p-8">
            <p className="text-shopici-black font-semibold text-lg">
              Notre objectif :
            </p>
            <p className="text-shopici-charcoal mt-2">
              {storeConfig.objective}
            </p>
          </div>
        </section>

        {/* Values */}
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
              description="Une équipe à l’écoute, proche de ses clients."
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
          <h2 className="text-3xl font-bold text-shopici-black mb-6">
            Pourquoi choisir {storeConfig.name} ?
          </h2>
          <ul className="space-y-3 text-shopici-charcoal">
            <li>✔ Suivi de commande clair et en temps réel</li>
            <li>✔ Produits sélectionnés avec soin</li>
            <li>✔ Livraison fiable</li>
            <li>✔ Service client réactif</li>
          </ul>
        </section>

        {/* Closing */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-shopici-black mb-4">
            {storeConfig.name}, plus qu’une boutique
          </h2>
          <p className="text-shopici-charcoal max-w-2xl mx-auto">
            Nous construisons une plateforme de confiance, pensée pour vous
            accompagner au quotidien.
          </p>
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
