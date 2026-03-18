"use client";

/**
 * app/order/[id]/ReceiptButton.tsx
 *
 * Client component — uses jsPDF to generate a PDF receipt in the browser.
 * No server round-trip needed. Install: npm install jspdf
 */

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrderItem {
    name:     string;
    quantity: number;
    price:    number;
}

interface OrderData {
    id:            string;
    total:         number;
    paid:          boolean;
    paidAt:        string | null;
    paymentMethod: string;
    createdAt:     string;
    customer: {
        name:         string;
        phone:        string;
        deliveryZone: string;
        callTime:     string;
    };
    items: OrderItem[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
    return new Intl.NumberFormat("fr-FR").format(n);
}

function fmtDate(d: string) {
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    }).format(new Date(d));
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ReceiptButton({ order }: { order: OrderData }) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            // Dynamic import — only loads jsPDF when the button is clicked
            const { jsPDF } = await import("jspdf");

            const doc  = new jsPDF({ unit: "mm", format: "a4" });
            const W    = 210;   // A4 width mm
            const pad  = 18;    // left/right margin
            let   y    = 0;     // current Y cursor

            // ── Palette ───────────────────────────────────────────────────────
            const CORAL  = [255, 107, 53]  as [number, number, number];
            const BLACK  = [18,  18,  18]  as [number, number, number];
            const GRAY   = [120, 120, 120] as [number, number, number];
            const LGRAY  = [245, 245, 245] as [number, number, number];
            const WHITE  = [255, 255, 255] as [number, number, number];
            const GREEN  = [34,  197, 94]  as [number, number, number];

            // ── Header band ───────────────────────────────────────────────────
            doc.setFillColor(...BLACK);
            doc.rect(0, 0, W, 40, "F");

            doc.setTextColor(...WHITE);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("SHOPICI", pad, 18);

            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...CORAL);
            doc.text("REÇU DE PAIEMENT", pad, 26);

            // Order ID badge top-right
            doc.setFillColor(...CORAL);
            doc.roundedRect(W - pad - 44, 8, 44, 12, 3, 3, "F");
            doc.setTextColor(...WHITE);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text(`#${order.id}`, W - pad - 22, 15.5, { align: "center" });

            y = 48;

            // ── Paid amount hero ───────────────────────────────────────────────
            doc.setFillColor(...LGRAY);
            doc.roundedRect(pad, y, W - pad * 2, 24, 4, 4, "F");

            doc.setTextColor(...GRAY);
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text("MONTANT PAYÉ", pad + 6, y + 8);

            doc.setTextColor(...CORAL);
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.text(`${fmt(order.total)} XAF`, pad + 6, y + 19);

            // Green paid badge
            doc.setFillColor(...GREEN);
            doc.roundedRect(W - pad - 30, y + 6, 30, 12, 3, 3, "F");
            doc.setTextColor(...WHITE);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text("PAYÉ ✓", W - pad - 15, y + 13.5, { align: "center" });

            y += 32;

            // ── Payment details row ───────────────────────────────────────────
            const payDate = order.paidAt ? fmtDate(order.paidAt) : fmtDate(order.createdAt);
            drawLabelValue(doc, pad, y, "Méthode de paiement", "Mobile Money (Fapshi)", GRAY, BLACK);
            drawLabelValue(doc, W / 2, y, "Date de paiement", payDate, GRAY, BLACK);
            y += 14;

            // ── Divider ───────────────────────────────────────────────────────
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(0.3);
            doc.line(pad, y, W - pad, y);
            y += 8;

            // ── Customer info ─────────────────────────────────────────────────
            sectionTitle(doc, pad, y, "INFORMATIONS CLIENT", CORAL);
            y += 8;

            drawLabelValue(doc, pad,      y, "Nom complet",  order.customer.name,         GRAY, BLACK);
            drawLabelValue(doc, W / 2,    y, "Téléphone",    order.customer.phone,         GRAY, BLACK);
            y += 10;
            drawLabelValue(doc, pad,      y, "Adresse",      order.customer.deliveryZone,  GRAY, BLACK);
            y += 14;

            // ── Divider ───────────────────────────────────────────────────────
            doc.setDrawColor(230, 230, 230);
            doc.line(pad, y, W - pad, y);
            y += 8;

            // ── Items table ───────────────────────────────────────────────────
            sectionTitle(doc, pad, y, "DÉTAIL DE LA COMMANDE", CORAL);
            y += 8;

            // Table header
            doc.setFillColor(...BLACK);
            doc.rect(pad, y, W - pad * 2, 9, "F");
            doc.setTextColor(...WHITE);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text("PRODUIT",  pad + 3,        y + 6);
            doc.text("QTÉ",      W - pad - 44,   y + 6, { align: "center" });
            doc.text("P.U",      W - pad - 24,   y + 6, { align: "center" });
            doc.text("TOTAL",    W - pad - 3,     y + 6, { align: "right" });
            y += 9;

            // Table rows
            order.items.forEach((item, i) => {
                const rowBg = i % 2 === 0 ? WHITE : LGRAY;
                doc.setFillColor(...rowBg);
                doc.rect(pad, y, W - pad * 2, 9, "F");

                doc.setTextColor(...BLACK);
                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");

                // Truncate long names
                const name = item.name.length > 38 ? item.name.slice(0, 35) + "..." : item.name;
                doc.text(name,                      pad + 3,       y + 6);
                doc.text(String(item.quantity),     W - pad - 44,  y + 6, { align: "center" });
                doc.text(`${fmt(item.price)}`,      W - pad - 24,  y + 6, { align: "center" });
                doc.setFont("helvetica", "bold");
                doc.text(`${fmt(item.price * item.quantity)} XAF`, W - pad - 3, y + 6, { align: "right" });
                y += 9;
            });

            // Total row
            doc.setFillColor(...CORAL);
            doc.rect(pad, y, W - pad * 2, 10, "F");
            doc.setTextColor(...WHITE);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text("TOTAL",                    pad + 3,   y + 7);
            doc.text(`${fmt(order.total)} XAF`,  W - pad - 3, y + 7, { align: "right" });
            y += 18;

            // ── Footer ────────────────────────────────────────────────────────
            doc.setFillColor(...BLACK);
            doc.rect(0, 280, W, 17, "F");
            doc.setTextColor(...GRAY);
            doc.setFontSize(7.5);
            doc.setFont("helvetica", "normal");
            doc.text("Shopici — votre boutique en ligne de confiance", W / 2, 287, { align: "center" });
            doc.setTextColor(...CORAL);
            doc.text(`Reçu généré le ${fmtDate(new Date().toISOString())}`, W / 2, 292, { align: "center" });

            // ── Save ──────────────────────────────────────────────────────────
            doc.save(`recu-shopici-${order.id}.pdf`);

        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Impossible de générer le reçu. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                loading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-shopici-coral hover:brightness-105 active:scale-[0.98] text-white shadow-lg shadow-shopici-coral/30"
            }`}
        >
            {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Génération du reçu...</>
            ) : (
                <><Download className="w-5 h-5" /> Télécharger le reçu PDF</>
            )}
        </button>
    );
}

// ── PDF drawing helpers ───────────────────────────────────────────────────────

function sectionTitle(
    doc:   InstanceType<typeof import("jspdf").jsPDF>,
    x:     number,
    y:     number,
    label: string,
    color: [number, number, number]
) {
    doc.setTextColor(...color);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(label, x, y);
}

function drawLabelValue(
    doc:        InstanceType<typeof import("jspdf").jsPDF>,
    x:          number,
    y:          number,
    label:      string,
    value:      string,
    labelColor: [number, number, number],
    valueColor: [number, number, number]
) {
    doc.setTextColor(...labelColor);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(label, x, y);

    doc.setTextColor(...valueColor);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(value, x, y + 5);
}