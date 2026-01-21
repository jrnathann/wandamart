"use client"
import { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";
import Link from "next/link";

type FAQItem = {
    id: string;
    question: string;
    answer: string;
    category?: string;
};

const faqs: FAQItem[] = [
    {
        id: "1",
        question: "Comment puis-je passer une commande ?",
        answer: "Parcourez notre catalogue, ajoutez les produits souhaités à votre panier, puis remplissez le formulaire de commande. Notre équipe vous contactera immédiatement par téléphone ou WhatsApp pour confirmer et organiser la livraison.",
        category: "Commandes"
    },
    {
        id: "2",
        question: "Quels sont les modes de paiement acceptés ?",
        answer: "Nous acceptons les paiements par Mobile Money (MTN, Orange), et paiement à la livraison dans certaines zones de Yaoundé.",
        category: "Paiement"
    },
    {
        id: "3",
        question: "Quel est le délai de livraison ?",
        answer: "Les livraisons se font généralement sous 24-48h pour Yaoundé et 3-5 jours ouvrables pour les autres villes du Cameroun.",
        category: "Livraison"
    },
    {
        id: "4",
        question: "Les frais de livraison sont-ils inclus ?",
        answer: "Les frais de livraison varient selon votre zone. La livraison est gratuite dans certaines zones de Yaoundé. Pour les autres zones, les frais vous seront communiqués lors de la confirmation de votre commande.",
        category: "Livraison",
    },

    {
        id: "5",
        question: "Comment suivre ma commande ?",
        answer: "Après validation de votre commande, vous recevrez un numéro de suivi par SMS et email. Vous pourrez suivre votre colis en temps réel depuis votre espace client.",
        category: "Commandes"
    }
];

export default function FAQSection() {
    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleItem = (id: string) => {
        setOpenItems(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    return (
        <section className="w-full py-16 px-4 bg-background">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-shopici-blue/10 rounded-2xl mb-4">
                        <HelpCircle className="w-8 h-8 text-shopici-blue" />
                    </div>
                    <h2 className="text-4xl font-bold text-shopici-black mb-4">
                        Questions Fréquentes
                    </h2>
                    <p className="text-lg text-shopici-charcoal max-w-2xl mx-auto">
                        Trouvez rapidement des réponses à vos questions. Si vous ne trouvez pas ce que vous cherchez, n'hésitez pas à nous contacter.
                    </p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {faqs.map((faq) => (
                        <div
                            key={faq.id}
                            className="group bg-background border border-shopici-gray/30 rounded-xl overflow-hidden hover:border-shopici-blue/50 transition-all duration-300 hover:shadow-lg"
                        >
                            <button
                                onClick={() => toggleItem(faq.id)}
                                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left transition-colors duration-300"
                            >
                                <div className="flex-1">
                                    {faq.category && (
                                        <span className="inline-block px-3 py-1 bg-shopici-blue/10 text-shopici-blue text-xs font-semibold rounded-full mb-2">
                                            {faq.category}
                                        </span>
                                    )}
                                    <h3 className="text-lg font-semibold text-shopici-black group-hover:text-shopici-blue transition-colors duration-300">
                                        {faq.question}
                                    </h3>
                                </div>

                                <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-shopici-gray/20 flex items-center justify-center transition-all duration-300 ${openItems.includes(faq.id)
                                    ? 'bg-shopici-blue text-white rotate-180'
                                    : 'text-shopici-charcoal group-hover:bg-shopici-blue/10 group-hover:text-shopici-blue'
                                    }`}>
                                    {openItems.includes(faq.id) ? (
                                        <Minus className="w-5 h-5" />
                                    ) : (
                                        <Plus className="w-5 h-5" />
                                    )}
                                </div>
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openItems.includes(faq.id)
                                    ? 'max-h-96 opacity-100'
                                    : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="px-6 pb-5 pt-0">
                                    <div className="pt-4 border-t border-shopici-gray/30">
                                        <p className="text-shopici-charcoal leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <p className="text-shopici-charcoal mb-4">
                        Vous n'avez pas trouvé la réponse à votre question ?
                    </p>
                    <Link href={"/contact"} className="inline-flex items-center gap-2 px-6 py-3 bg-shopici-black hover:bg-shopici-blue text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]">
                        <HelpCircle className="w-5 h-5" />
                        Contactez-nous
                    </Link>
                </div>
            </div>
        </section>
    );
}