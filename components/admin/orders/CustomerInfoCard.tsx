"use client"

import { MapPin, MessageCircle, Copy, Clock, Phone } from "lucide-react";
import type { CustomerInfo } from "@/types/OrderTracking";

interface CustomerInfoCardProps {
  customer: CustomerInfo;
  orderId?: string;
  items?: Array<{ name: string; quantity: number }>;
}

export default function CustomerInfoCard({ customer, orderId, items }: CustomerInfoCardProps) {
  const getCallTimeLabel = (time: CustomerInfo["callTime"]) => {
    const labels: Record<CustomerInfo["callTime"], string> = {
      now: "Maintenant",
      morning: "Matin (08h–12h)",
      afternoon: "Après-midi (12h–17h)",
      evening: "Soir (17h–20h)",
    };
    return labels[time];
  };

  const productSummary = items && items.length > 0
    ? items.map(i => `${i.quantity}x ${i.name}`).join(", ")
    : null;

  const trackingLink = orderId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/shipping?id=${orderId}`
    : null;

  const automatedNotice =
    `⚠️ _Ceci est un message automatique — Automated message_ ⚠️\n` +
    `─────────────────────────\n\n`;

  // ── French blocks ──────────────────────────────────────────────────────────
  const frTrackingBlock = trackingLink
    ? `\n\n🔗 Suivez votre commande en temps réel ici :\n${trackingLink}`
    : "";

  const frAgencyBlock =
    `\n\n💳 *Si vous êtes en dehors de Yaoundé :* votre commande sera expédiée via une agence de voyage. Le règlement s'effectue par *MTN MoMo* ou *Orange Money* — le numéro vous sera communiqué sur demande.`;

  // ── English blocks ─────────────────────────────────────────────────────────
  const enTrackingBlock = trackingLink
    ? `\n\n🔗 Track your order in real time here:\n${trackingLink}`
    : "";

  const enAgencyBlock =
    `\n\n💳 *If you are outside Yaoundé:* your order will be shipped via a travel agency. Payment is made via *MTN MoMo* or *Orange Money* — the number will be provided upon request.`;

  // ── Message 1: Order confirmed ─────────────────────────────────────────────
  const confirmedMessage = automatedNotice + (productSummary
    ? `Bonjour ${customer.name}, votre commande a bien été reçue.\n\n🛍️ Produit(s) commandé(s) : ${productSummary}${frTrackingBlock}${frAgencyBlock}\n\nNotre équipe va vous contacter concernant la livraison.\nMerci pour votre confiance 🙏\n\n---\n\nHello ${customer.name}, your order has been successfully received.\n\n🛍️ Ordered item(s): ${productSummary}${enTrackingBlock}${enAgencyBlock}\n\nOur team will be in touch shortly to arrange your delivery.\nThank you for your trust.`
    : `Bonjour ${customer.name}, votre commande a bien été reçue.${frTrackingBlock}${frAgencyBlock}\n\nNotre équipe va vous contacter concernant la livraison.\nMerci pour votre confiance 🙏\n\n---\n\nHello ${customer.name}, your order has been successfully received.${enTrackingBlock}${enAgencyBlock}\n\nOur team will be in touch shortly to arrange your delivery.\nThank you for your trust.`);

  // ── Message 2: Order cancelled ─────────────────────────────────────────────
  const cancelledMessage = automatedNotice + (productSummary
    ? `Bonjour ${customer.name}, nous vous informons que votre commande a malheureusement été annulée.\n\n🛍️ Produit(s) concerné(s) : ${productSummary}\n\nNous sommes désolés pour ce désagrément. N'hésitez pas à nous contacter ou à passer une nouvelle commande.\n\n---\n\nHello ${customer.name}, we regret to inform you that your order has been cancelled.\n\n🛍️ Item(s): ${productSummary}\n\nWe apologize for the inconvenience. Feel free to contact us or place a new order.`
    : `Bonjour ${customer.name}, nous vous informons que votre commande a malheureusement été annulée.\n\nNous sommes désolés pour ce désagrément. N'hésitez pas à nous contacter ou à passer une nouvelle commande.\n\n---\n\nHello ${customer.name}, we regret to inform you that your order has been cancelled.\n\nWe apologize for the inconvenience. Feel free to contact us or place a new order.`);

  const waBase = `https://wa.me/${customer.phone.replace(/\s/g, "")}?text=`;

  return (
    <div className="bg-white border border-shopici-black/10 p-5 md:p-8 rounded-none">

      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 pb-6 border-b border-shopici-black/5">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-shopici-black/30">
            Fiche Client
          </h3>
          <p className="text-2xl font-black text-shopici-black tracking-tight uppercase">
            {customer.name}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* WhatsApp: Confirmer */}
          {customer.hasWhatsApp && (
            <a
              href={`${waBase}${encodeURIComponent(confirmedMessage)}`}
              target="_blank"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
            >
              <MessageCircle size={14} fill="currentColor" />
              Confirmer
            </a>
          )}

          {/* WhatsApp: Annuler */}
          {customer.hasWhatsApp && (
            <a
              href={`${waBase}${encodeURIComponent(cancelledMessage)}`}
              target="_blank"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
            >
              <MessageCircle size={14} fill="currentColor" />
              Annuler
            </a>
          )}

          {/* Call button */}
          <a
            href={`tel:${customer.phone}`}
            className="p-3 border-2 border-shopici-black text-shopici-black hover:bg-black hover:text-white transition-all"
          >
            <Phone size={16} />
          </a>
        </div>
      </div>

      {/* 2. DATA GRID */}
      <div className="space-y-8">
        {/* ROW 1: Contact & Delivery */}
        <div className="grid grid-cols-2 gap-x-8">
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-shopici-black/40">Téléphone</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tabular-nums text-shopici-black">{customer.phone}</span>
              <button
                onClick={() => navigator.clipboard.writeText(customer.phone)}
                className="text-shopici-black/20 hover:text-shopici-black"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-shopici-black/40">Livraison</p>
            <div className="flex items-center gap-2 text-sm font-black text-shopici-black uppercase leading-tight">
              <MapPin size={14} className="text-shopici-blue shrink-0" />
              <span>{customer.deliveryZone}</span>
            </div>
          </div>
        </div>

        {/* ROW 2: Availability */}
        <div className="pt-6 border-t border-shopici-black/5">
          <p className="text-[9px] font-black uppercase tracking-widest text-shopici-black/40 mb-3">
            Disponibilité d'appel
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-shopici-coral/5 border border-shopici-coral/20 text-xs font-black text-shopici-black uppercase">
            <Clock size={14} className="text-shopici-coral shrink-0" />
            {getCallTimeLabel(customer.callTime)}
          </div>
        </div>
      </div>

      {/* 3. FOOTER */}
      <div className="mt-10 flex items-center justify-between opacity-20">
        <div className="text-[8px] font-mono font-bold uppercase tracking-[0.2em]">Logistics v3.0</div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-shopici-black" />
          <div className="w-1.5 h-1.5 bg-shopici-blue" />
        </div>
      </div>
    </div>
  );
}