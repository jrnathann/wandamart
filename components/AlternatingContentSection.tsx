"use client";

import { useEffect, useRef, useState } from "react";
import type { ContentBlock } from "@/types/Product";
import { CheckCircle2 } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";
import { CldImage } from "next-cloudinary";

interface Props {
    blocks: ContentBlock[];
}

function useReveal() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return { ref, visible };
}

function Block({ block, index }: { block: ContentBlock; index: number }) {
    const { ref, visible } = useReveal();
    const isEven = index % 2 === 0;
    const paragraphs = block.body.split("\n").filter(Boolean);

    return (
        <div
            ref={ref}
            className={`
        grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden
        transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}
      `}
        >
            {/* ── Image Panel (Editorial Style) ── */}
            <div className={`relative aspect-square lg:aspect-auto overflow-hidden ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                <CldImage
                    src={block.image.url}
                    alt={block.image.alt ?? block.heading}
                    fill
                    sizes="100vw"
                    className={`object-cover transition-transform duration-[1.5s] ease-out ${visible ? "scale-100" : "scale-110"}`}
                />
                {/* Brand Overlay */}
                <div className="absolute inset-0 bg-shopici-black/10 mix-blend-multiply" />
            </div>

            {/* ── Text Panel ── */}
            <div className={`flex flex-col justify-center p-8 lg:p-20 bg-white ${isEven ? "lg:order-2 border-l border-shopici-gray/10" : "lg:order-1 border-r border-shopici-gray/10"}`}>
                {block.eyebrow && (
                    <span className="mb-4 inline-block text-[10px] font-black tracking-[0.3em] uppercase text-shopici-coral">
                        {block.eyebrow}
                    </span>
                )}

                <h3 className="text-3xl lg:text-5xl font-black text-shopici-black leading-[0.9] italic uppercase tracking-tighter mb-8">
                    {block.heading}
                </h3>

                {/* The Shopici Slant Rule */}
                <div className="mb-8 h-1 w-20 bg-shopici-blue -skew-x-12" />

                <div className="space-y-6">
                    {paragraphs.map((p, i) => (
                        <p key={i} className="text-shopici-black/70 leading-relaxed text-sm md:text-base font-medium">
                            {p}
                        </p>
                    ))}
                </div>

                {block.highlights && block.highlights.length > 0 && (
                    <ul className="mt-10 space-y-4">
                        {block.highlights.map((h, i) => (
                            <li key={i} className="flex items-center gap-4 text-sm font-bold text-shopici-black uppercase tracking-tight">
                                <CheckCircle2 className="w-5 h-5 text-shopici-blue shrink-0" />
                                {h}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default function AlternatingContentSection({ blocks }: Props) {
    const siteConfig = useConfig();

    if (!siteConfig || !blocks || blocks.length === 0) return null;
    return (
        <section className="my-24 space-y-2">
            {/* Section Header */}
            <div className="max-w-7xl mx-auto px-6 mb-16">
                <div className="flex flex-col items-start gap-2">
                    <div className="bg-shopici-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                        {siteConfig.name} Exclusive
                    </div>
                    <h2 className="text-4xl lg:text-7xl font-black text-shopici-black uppercase tracking-tighter leading-none">
                        Pourquoi ce <span className="text-shopici-blue">produit</span>?
                    </h2>
                </div>
            </div>

            {/* Full-bleed style blocks with max-width content containment */}
            <div className="max-w-[1440px] mx-auto lg:px-6">
                <div className="flex flex-col gap-12 lg:gap-0 rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl shadow-shopici-black/5">
                    {blocks.map((block, i) => (
                        <Block key={block.id} block={block} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}