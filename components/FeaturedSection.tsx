import { Clock, Star, MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";

const features = [
    {
        icon: Clock,
        title: "Livraison 24h/48h",
        desc: "Service prioritaire pour Yaoundé et Douala. Expédition sécurisée dans tout le triangle national.",
        tag: "LOGISTIQUE"
    },
    {
        icon: Star,
        title: "Qualité Garantie",
        desc: "Une sélection rigoureuse d'articles authentiques. Chaque colis est vérifié avant l'envoi.",
        tag: "EXCELLENCE"
    },
    {
        icon: MapPin,
        title: "Réseau National",
        desc: "Plus de 50 agences partenaires pour une proximité totale avec nos clients au Cameroun.",
        tag: "PROXIMITÉ"
    },
    {
        icon: ShieldCheck,
        title: "Achat Sécurisé",
        desc: "Protection totale de vos transactions. Paiement à la livraison ou via MOMO/Orange Money.",
        tag: "CONFIANCE"
    }
];

export default function FeaturesSection() {
    return (
        <section className="bg-white border-t border-shopici-gray/30 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {features.map((f, i) => (
                        <div 
                            key={i} 
                            className="group p-10 md:p-12 border-b lg:border-b-0 lg:border-r border-shopici-gray/30 last:border-r-0 hover:bg-shopici-gray/5 transition-colors duration-500"
                        >
                            {/* Decorative Accent & Icon */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-3 rounded-xl bg-shopici-blue/10 text-shopici-blue group-hover:bg-shopici-blue group-hover:text-white transition-all duration-300">
                                    <f.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black tracking-[0.2em] text-shopici-coral">
                                    {f.tag}
                                </span>
                            </div>

                            {/* Content Layer */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-shopici-black leading-tight group-hover:text-shopici-blue transition-colors">
                                    {f.title.toUpperCase()}
                                </h3>
                                <p className="text-shopici-charcoal text-sm leading-relaxed font-medium">
                                    {f.desc}
                                </p>
                            </div>

                            {/* Bottom detail for 'Fullness' */}
                            <div className="mt-10 flex items-center gap-2 text-[10px] font-bold text-shopici-gray group-hover:text-shopici-coral transition-all duration-300">
                                <div className="w-6 h-px bg-current" />
                                <span>VOIR DÉTAILS</span>
                                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}