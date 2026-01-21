"use client"
import { useState } from "react";
import { Mail, Phone, MapPin, Facebook, Send, MessageSquare, Clock } from "lucide-react";
import { storeConfig } from "@/data/configData";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erreur lors de l'envoi du message");

      setSubmitStatus("success");

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });

      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (err) {
      console.error(err);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-shopici-black to-text-[#414141] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contactez-nous</h1>
          <p className="text-lg text-[#414141] max-w-2xl mx-auto">
            Une question ? Besoin d'aide ? Notre équipe est là pour vous accompagner
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-shopici-black mb-6">
                Informations de Contact
              </h2>
              <p className="text-[#414141] mb-8">
                N'hésitez pas à nous contacter par l'un des moyens ci-dessous. Nous répondons généralement sous 24h.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              <div className="bg-white border border-shopici-gray/30 rounded-xl p-5 hover:border-shopici-blue/50 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-shopici-coral/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-shopici-coral" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-shopici-black mb-1">Adresse</h3>
                    <p className="text-sm text-[#414141]">
                      {storeConfig.contact.address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-shopici-gray/30 rounded-xl p-5 hover:border-shopici-blue/50 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-shopici-coral/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-shopici-coral" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-shopici-black mb-1">Téléphone</h3>
                    <a href="tel:+237" className="text-sm text-[#414141] hover:text-shopici-coral transition-colors">
                      {storeConfig.contact.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-shopici-gray/30 rounded-xl p-5 hover:border-shopici-blue/50 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-shopici-coral/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-shopici-coral" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-shopici-black mb-1">Horaires</h3>
                    <p className="text-sm text-[#414141]">
                      Lun - Sam: 8h00 - 18h00
                    </p>
                    <p className="text-sm text-[#414141]">
                      Dimanche: Fermé
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-gradient-to-br from-shopici-blue/10 to-shopici-coral/10 rounded-xl p-6">
              <h3 className="font-semibold text-shopici-black mb-4">Suivez-nous</h3>
              <a
                href={`${storeConfig.social.facebook}?ref=header`} 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-shopici-black hover:bg-shopici-blue text-white rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                <Facebook className="w-5 h-5" />
                <span className="font-medium">Facebook</span>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-shopici-gray/30 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-shopici-coral/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-shopici-coral" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-shopici-black">Envoyez-nous un message</h2>
                  <p className="text-sm text-[#414141]">Nous vous répondrons dans les plus brefs délais</p>
                </div>
              </div>

              {submitStatus === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm font-medium">
                    ✓ Message envoyé avec succès ! Nous vous contacterons bientôt.
                  </p>
                </div>
              )}

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-shopici-black mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-shopici-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-shopici-blue focus:border-transparent transition-all bg-white text-shopici-black"
                      placeholder="Votre nom"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-shopici-black mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-shopici-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-shopici-blue focus:border-transparent transition-all bg-white text-shopici-black"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-shopici-black mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-shopici-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-shopici-blue focus:border-transparent transition-all bg-white text-shopici-black"
                      placeholder="+237 XXX XXX XXX"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-shopici-black mb-2">
                      Sujet *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-shopici-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-shopici-blue focus:border-transparent transition-all bg-white text-shopici-black"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="order">Question sur une commande</option>
                      <option value="product">Information produit</option>
                      <option value="delivery">Livraison</option>
                      <option value="payment">Paiement</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-shopici-black mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-shopici-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-shopici-blue focus:border-transparent transition-all resize-none bg-white text-shopici-black"
                    placeholder="Écrivez votre message ici..."
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-8 py-4 bg-shopici-black hover:bg-shopici-blue text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Envoyer le message</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}