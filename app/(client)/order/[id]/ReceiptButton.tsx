"use client";

/**
 * app/order/[id]/ReceiptButton.tsx
 *
 * Renders a hidden HTML receipt, screenshots it with html2canvas,
 * then saves it as a PDF via jsPDF.
 *
 * Install: npm install jspdf html2canvas
 */

import { useState, useRef } from "react";
import { Download, Loader2 } from "lucide-react";

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

function fmt(n: number) {
    return new Intl.NumberFormat("fr-FR").format(n);
}

function fmtDate(d: string) {
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    }).format(new Date(d));
}

// ── The receipt HTML — styled inline so html2canvas captures it correctly ─────

function ReceiptHTML({ order }: { order: OrderData }) {
    const payDate = order.paidAt ? fmtDate(order.paidAt) : fmtDate(order.createdAt);

    return (
        <div style={{
            width: "794px",           // A4 at 96dpi
            background: "#ffffff",
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            color: "#111",
        }}>

            {/* ── Header ── */}
            <div style={{
                background: "#121212",
                padding: "32px 40px 28px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
            }}>
                <div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>
                        SHOPICI
                    </div>
                    <div style={{ fontSize: 11, color: "#FF6B35", fontWeight: 700, letterSpacing: 3, marginTop: 4 }}>
                        REÇU DE PAIEMENT
                    </div>
                </div>
                <div style={{
                    background: "#FF6B35",
                    borderRadius: 8,
                    padding: "6px 14px",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                }}>
                    #{order.id}
                </div>
            </div>

            {/* ── Amount hero ── */}
            <div style={{
                background: "#f7f7f7",
                padding: "24px 40px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #ebebeb",
            }}>
                <div>
                    <div style={{ fontSize: 11, color: "#999", fontWeight: 600, letterSpacing: 2, marginBottom: 4 }}>
                        MONTANT PAYÉ
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: "#FF6B35", letterSpacing: -1 }}>
                        {fmt(order.total)} <span style={{ fontSize: 18, fontWeight: 700 }}>XAF</span>
                    </div>
                </div>
                <div style={{
                    background: "#22c55e",
                    borderRadius: 100,
                    padding: "8px 20px",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: 1,
                }}>
                    ✓ PAYÉ
                </div>
            </div>

            {/* ── Payment meta ── */}
            <div style={{
                padding: "20px 40px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                borderBottom: "1px solid #ebebeb",
            }}>
                <MetaField label="Méthode de paiement" value="Mobile Money" />
                <MetaField label="Date de paiement"     value={payDate} />
            </div>

            {/* ── Customer info ── */}
            <div style={{ padding: "20px 40px 0", borderBottom: "1px solid #ebebeb" }}>
                <SectionTitle label="INFORMATIONS CLIENT" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "12px 0 20px" }}>
                    <MetaField label="Nom complet"  value={order.customer.name} />
                    <MetaField label="Téléphone"    value={order.customer.phone} />
                    <MetaField label="Zone de livraison" value={order.customer.deliveryZone} />
                </div>
            </div>

            {/* ── Items table ── */}
            <div style={{ padding: "20px 40px 0" }}>
                <SectionTitle label="DÉTAIL DE LA COMMANDE" />
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
                    <thead>
                        <tr style={{ background: "#121212", color: "#fff" }}>
                            <th style={thStyle("left")}>Produit</th>
                            <th style={thStyle("center")}>Qté</th>
                            <th style={thStyle("right")}>Prix unit.</th>
                            <th style={thStyle("right")}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                                <td style={tdStyle("left")}>{item.name}</td>
                                <td style={tdStyle("center")}>{item.quantity}</td>
                                <td style={tdStyle("right")}>{fmt(item.price)} XAF</td>
                                <td style={{ ...tdStyle("right"), fontWeight: 700 }}>
                                    {fmt(item.price * item.quantity)} XAF
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ background: "#FF6B35", color: "#fff" }}>
                            <td colSpan={3} style={{ ...tdStyle("left"), fontWeight: 800, fontSize: 13 }}>TOTAL</td>
                            <td style={{ ...tdStyle("right"), fontWeight: 900, fontSize: 14 }}>
                                {fmt(order.total)} XAF
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* ── Footer ── */}
            <div style={{
                background: "#121212",
                marginTop: 32,
                padding: "18px 40px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <div style={{ color: "#666", fontSize: 11 }}>
                    Shopici — votre boutique en ligne de confiance
                </div>
                <div style={{ color: "#FF6B35", fontSize: 11, fontWeight: 600 }}>
                    Généré le {fmtDate(new Date().toISOString())}
                </div>
            </div>
        </div>
    );
}

// ── Small helpers ──────────────────────────────────────────────────────────────

function SectionTitle({ label }: { label: string }) {
    return (
        <div style={{ fontSize: 10, fontWeight: 800, color: "#FF6B35", letterSpacing: 2 }}>
            {label}
        </div>
    );
}

function MetaField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div style={{ fontSize: 10, color: "#999", fontWeight: 600, letterSpacing: 1, marginBottom: 3 }}>
                {label.toUpperCase()}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{value}</div>
        </div>
    );
}

function thStyle(align: "left" | "center" | "right"): React.CSSProperties {
    return { padding: "10px 12px", fontSize: 10, fontWeight: 700, textAlign: align, letterSpacing: 1 };
}

function tdStyle(align: "left" | "center" | "right"): React.CSSProperties {
    return { padding: "10px 12px", fontSize: 12, textAlign: align, color: "#222", borderBottom: "1px solid #ebebeb" };
}

// ── Button ────────────────────────────────────────────────────────────────────

export function ReceiptButton({ order }: { order: OrderData }) {
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
                import("html2canvas"),
                import("jspdf"),
            ]);

            const el = containerRef.current!;

            const canvas = await html2canvas(el, {
                scale: 2,           // 2× for crisp output
                useCORS: true,
                backgroundColor: "#ffffff",
            });

            const imgData = canvas.toDataURL("image/png");

            // A4 in mm: 210 × 297
            const pdf    = new jsPDF({ unit: "mm", format: "a4" });
            const pdfW   = pdf.internal.pageSize.getWidth();
            const pdfH   = (canvas.height * pdfW) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
            pdf.save(`recu-shopici-${order.id}.pdf`);

        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Impossible de générer le reçu. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Hidden receipt — off-screen but rendered so html2canvas can read it */}
            <div
                style={{ position: "absolute", top: -9999, left: -9999, pointerEvents: "none" }}
                aria-hidden="true"
            >
                <div ref={containerRef}>
                    <ReceiptHTML order={order} />
                </div>
            </div>

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
        </>
    );
}