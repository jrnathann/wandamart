// ─── CartOrderForm ────────────────────────────────────────────────────────────

export interface CartOrderForm {
  name: string;
  phone: string;
  phoneConfirmed: boolean;
  deliveryZone: string;
  quartier: string;
  callTime: string;
  hasWhatsApp: boolean;
  hasCash: boolean | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const STEPS = 4;

export const SCROLLBAR_CSS = `
  .shopici-scroll::-webkit-scrollbar { width: 4px; }
  .shopici-scroll::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 999px; }
  .shopici-scroll::-webkit-scrollbar-thumb { background: #FF6B35; border-radius: 999px; }
  .shopici-scroll { scrollbar-width: thin; scrollbar-color: #FF6B35 #f3f4f6; }
`;

export const EMPTY_FORM: CartOrderForm = {
  name: "",
  phone: "",
  phoneConfirmed: false,
  deliveryZone: "",
  quartier: "",
  callTime: "",
  hasWhatsApp: false,
  hasCash: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR").format(price);
}

export function stepLabel(step: number) {
  return [
    "Êtes-vous prêt(e) ?",
    "Vos coordonnées",
    "Votre adresse",
    "Créneau & confirmation",
  ][step - 1] ?? "";
}

export function getHour() {
  return new Date().getHours();
}

export function getCallTimeLabel(value: string): string {
  const h = getHour();
  if (value === "now")       return "dès maintenant";
  if (value === "morning")   return h >= 12 ? "demain matin (8h–12h)"       : "ce matin (8h–12h)";
  if (value === "afternoon") return h >= 17 ? "demain après-midi (12h–17h)" : "cet après-midi (12h–17h)";
  if (value === "evening")   return h >= 20 ? "demain soir (17h–20h)"       : "ce soir (17h–20h)";
  return value;
}