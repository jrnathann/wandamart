"use client"

import { Package, MapPin, MessageCircle, Copy } from "lucide-react";
import type { CustomerInfo } from "@/types/OrderTracking";

interface CustomerInfoCardProps {
  customer: CustomerInfo;
}

export default function CustomerInfoCard({ customer }: CustomerInfoCardProps) {
  const getCallTimeLabel = (time: CustomerInfo["callTime"]) => {
    const labels: Record<CustomerInfo["callTime"], string> = {
      now:       "📲 Maintenant",
      morning:   "🌅 Matin (8h–12h)",
      afternoon: "☀️ Après-midi (12h–17h)",
      evening:   "🌙 Soir (17h–20h)",
    };

    return labels[time];
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200">
      <h3 className="text-sm font-bold text-shopici-black mb-3 flex items-center gap-2">
        <Package className="w-4 h-4 text-shopici-blue" />
        Informations client
      </h3>

      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Name */}
        <div>
          <p className="text-shopici-charcoal mb-1">Nom</p>
          <p className="font-semibold text-shopici-black">{customer.name}</p>
        </div>

        {/* Phone */}
        <div>
          <p className="text-shopici-charcoal mb-1">Téléphone</p>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-shopici-black">{customer.phone}</p>

            <button
              type="button"
              onClick={() => copyToClipboard(customer.phone)}
              className="p-1 hover:bg-slate-100 rounded"
              aria-label="Copier le numéro"
            >
              <Copy className="w-3 h-3 text-shopici-charcoal" />
            </button>

            {customer.hasWhatsApp && (
              <a
                href={`https://wa.me/${customer.phone.replace(/\s/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 bg-green-100 rounded hover:bg-green-200 transition"
                aria-label="Contacter via WhatsApp"
              >
                <MessageCircle className="w-3 h-3 text-green-600" />
              </a>
            )}
          </div>
        </div>

        {/* Delivery zone */}
        <div>
          <p className="text-shopici-charcoal mb-1">Zone de livraison</p>
          <p className="font-semibold text-shopici-black flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {customer.deliveryZone}
          </p>
        </div>

        {/* Call time */}
        <div>
          <p className="text-shopici-charcoal mb-1">Créneau d'appel</p>
          <p className="font-semibold text-shopici-black text-xs">
            {getCallTimeLabel(customer.callTime)}
          </p>
        </div>
      </div>
    </div>
  );
}