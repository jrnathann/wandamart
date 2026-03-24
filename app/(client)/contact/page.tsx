"use client"

import { useState } from "react";
import { Phone, MapPin, Facebook, Send, Clock, ChevronDown } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";

export default function ContactPage() {
  const storeConfig = useConfig();
  const loading = !storeConfig;

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", subject: "", message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Erreur");
      setSubmitStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (err) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--shopici-background)]">
      {/* 1. Header Section */}
      <div className="relative pt-24 pb-20 px-6 bg-[var(--shopici-background)] border-b border-shopici-gray/10">
        <div className="max-w-7xl mx-auto text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-6">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-shopici-blue">Service Client</span>
                <div className="h-[1px] w-12 bg-shopici-blue/30" />
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-shopici-black uppercase tracking-tighter leading-[0.8]">
                Entrez en <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-shopici-black to-shopici-charcoal/30">Contact</span>
              </h1>
            </div>
            <div className="max-w-xs border-l-[3px] border-shopici-coral pl-8 py-2 mx-auto md:mx-0">
              <p className="text-[12px] font-bold text-shopici-charcoal/60 uppercase tracking-widest leading-relaxed">
                Une assistance personnalisée pour une expérience d'achat d'exception au Cameroun.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

          {/* 2. Sidebar Info */}
          <div className="lg:col-span-4 space-y-16">
            <div className="space-y-10">
              <label className="block text-[11px] font-black uppercase tracking-[0.3em] text-shopici-charcoal/30 border-b border-shopici-gray/10 pb-6">
                Directives & Accès
              </label>

              <div className="space-y-12">
                <div className="flex gap-8">
                  <MapPin className="w-5 h-5 text-shopici-blue shrink-0 mt-1" />
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-shopici-black">Localisation</h3>
                    {loading ? <div className="h-4 w-40 bg-shopici-gray/10 animate-pulse" /> : (
                      <p className="text-sm font-bold text-shopici-charcoal/70 uppercase tracking-tight">
                        {storeConfig?.contact?.address || "Yaoundé, Cameroun"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-8">
                  <Phone className="w-5 h-5 text-shopici-blue shrink-0 mt-1" />
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-shopici-black">Ligne Directe</h3>
                    {loading ? <div className="h-4 w-32 bg-shopici-gray/10 animate-pulse" /> : (
                      <a href={`tel:${storeConfig?.contact?.phone}`} className="text-sm font-black text-shopici-black hover:text-shopici-coral transition-colors underline decoration-shopici-gray/30 underline-offset-4">
                        {storeConfig?.contact?.phone || "+237 000 000 000"}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-8">
                  <Clock className="w-5 h-5 text-shopici-blue shrink-0 mt-1" />
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-shopici-black">Disponibilité</h3>
                    <p className="text-sm font-bold text-shopici-charcoal/70 uppercase">Lun — Sam: 08H00 - 18H00</p>
                    <p className="text-[10px] font-black text-shopici-coral uppercase tracking-[0.2em]">Dimanche: Fermé</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Form Section */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-shopici-gray/10 p-10 md:p-16 shadow-[20px_20px_60px_rgba(0,0,0,0.02)]">
              <div className="mb-16 flex items-baseline justify-between">
                <div>
                  <h2 className="text-3xl font-black text-shopici-black uppercase tracking-tighter">Transmission</h2>
                  <div className="h-[3px] w-16 bg-shopici-coral mt-2" />
                </div>
                <span className="text-[10px] font-black text-shopici-gray/40 uppercase tracking-widest">Section 02</span>
              </div>

              {submitStatus === "success" && (
                <div className="mb-10 p-5 bg-shopici-blue text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-4">
                  <div className="h-2 w-2 bg-white animate-ping rounded-full" />
                  Message transmis avec succès
                </div>
              )}

              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="group relative">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-shopici-charcoal/40 mb-3 block group-focus-within:text-shopici-blue transition-colors">Nom Complet</label>
                    <input
                      type="text" name="name" value={formData.name} onChange={handleChange} required
                      className="w-full bg-transparent border-b-2 border-shopici-gray/10 py-3 text-sm font-bold uppercase tracking-wider focus:border-shopici-black focus:outline-none transition-all placeholder:text-shopici-charcoal/40 focus:placeholder:text-shopici-coral/30"
                      placeholder="EX: JEAN DOUALA"
                    />
                  </div>
                  <div className="group relative">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-shopici-charcoal/40 mb-3 block group-focus-within:text-shopici-blue transition-colors">Email</label>
                    <input
                      type="email" name="email" value={formData.email} onChange={handleChange} required
                      className="w-full bg-transparent border-b-2 border-shopici-gray/10 py-3 text-sm font-bold focus:border-shopici-black focus:outline-none transition-all placeholder:text-shopici-charcoal/40 focus:placeholder:text-shopici-coral/30"
                      placeholder="CONTACT@DOMAIN.COM"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="group relative">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-shopici-charcoal/40 mb-3 block group-focus-within:text-shopici-blue transition-colors">Téléphone</label>
                    <input
                      type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      className="w-full bg-transparent border-b-2 border-shopici-gray/10 py-3 text-sm font-bold focus:border-shopici-black focus:outline-none transition-all placeholder:text-shopici-charcoal/40 focus:placeholder:text-shopici-coral/30"
                      placeholder="+237 ..."
                    />
                  </div>
                  <div className="group relative">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-shopici-charcoal/40 mb-3 block">Objet</label>
                    <div className="relative">
                      <select
                        name="subject" value={formData.subject} onChange={handleChange} required
                        className="w-full bg-transparent border-b-2 border-shopici-gray/10 py-3 text-sm font-bold appearance-none focus:border-shopici-black focus:outline-none transition-all cursor-pointer uppercase tracking-widest"
                      >
                        <option value="">SÉLECTIONNER</option>
                        <option value="order">COMMANDES</option>
                        <option value="product">INFOS PRODUITS</option>
                        <option value="other">AUTRE</option>
                      </select>
                      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-shopici-gray/40 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="group relative">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-shopici-charcoal/40 mb-3 block group-focus-within:text-shopici-blue transition-colors">Votre Message</label>
                  <textarea
                    name="message" value={formData.message} onChange={handleChange} required rows={4}
                    className="w-full bg-transparent border-b-2 border-shopici-gray/10 py-3 text-sm font-bold focus:border-shopici-black focus:outline-none transition-all resize-none placeholder:text-shopici-charcoal/40 focus:placeholder:text-shopici-coral/30"
                    placeholder="DÉTAILLEZ VOTRE DEMANDE ICI..."
                  />
                </div>

                {/* Updated Button Section */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`
                      w-full md:w-auto bg-shopici-black px-8 md:px-16 py-4 md:py-6 
                      text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] 
                      text-white transition-all flex items-center justify-center gap-4 md:gap-6 group 
                      ${isSubmitting
                      ? "opacity-50 cursor-not-allowed pointer-events-none"
                      : "hover:bg-shopici-blue active:scale-95 cursor-pointer"
                    }
                  `}
                >
                  <span className="relative z-10">
                    {isSubmitting ? "TRANSMISSION..." : "ENVOYER LE MESSAGE"}
                  </span>
                  <Send className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform ${!isSubmitting && 'group-hover:translate-x-2'} ${isSubmitting ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}