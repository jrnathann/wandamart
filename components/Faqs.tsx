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
    // Keeping your original logic of allowing multiple open items
    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleItem = (id: string) => {
        setOpenItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    return (
        <section className="w-full py-12 px-4 bg-white border-t border-gray-100">
            <div className="max-w-4xl mx-auto">
                {/* Compact Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[#414141] flex items-center gap-2">
                            <HelpCircle className="w-6 h-6 text-shopici-blue" />
                            Questions Fréquentes
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Réponses rapides pour vos commandes au Cameroun.
                        </p>
                    </div>
                    <Link href="/contact" className="text-shopici-blue text-sm font-semibold hover:underline">
                        Besoin d'aide ? Contactez-nous →
                    </Link>
                </div>

                {/* Tightened FAQ List */}
                <div className="divide-y divide-gray-100 border-y border-gray-100">
                    {faqs.map((faq) => {
                        const isOpen = openItems.includes(faq.id);
                        return (
                            <div key={faq.id} className="group transition-colors hover:bg-gray-50/50">
                                <button
                                    onClick={() => toggleItem(faq.id)}
                                    className="w-full py-4 flex items-center justify-between gap-4 text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Subtle Category Tag */}
                                        <span className="hidden sm:block text-[10px] font-bold uppercase tracking-wider text-gray-400 w-20">
                                            {faq.category}
                                        </span>
                                        <h3 className={`text-base font-medium transition-colors ${
                                            isOpen ? "text-shopici-blue" : "text-[#414141]"
                                        }`}>
                                            {faq.question}
                                        </h3>
                                    </div>

                                    <div className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-shopici-blue' : 'text-gray-400'}`}>
                                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    </div>
                                </button>

                                <div className={`overflow-hidden transition-all duration-200 ease-in-out ${
                                    isOpen ? 'max-h-40 opacity-100 pb-4' : 'max-h-0 opacity-0'
                                }`}>
                                    <div className="pl-0 sm:pl-24 pr-8">
                                        <p className="text-sm text-gray-600 leading-relaxed border-l-2 border-shopici-blue/20 pl-4">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}