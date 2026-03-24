"use client";

import { useEffect, useState, useMemo } from "react";
import { StoreConfigType, BannerSlide } from "@/types/StoreConfig";

export function useStoreConfig() {
  const [config, setConfig] = useState<StoreConfigType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. FETCH
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/config");
        const data = await res.json();
        setConfig(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 2. DERIVED STATE
  const stats = useMemo(() => {
    return {
      totalSlides: config?.bannerSlides?.length || 0,
      hasLogo: !!config?.logo,
    };
  }, [config]);

  // 3. ACTIONS
  const updateField = (field: keyof StoreConfigType, value: any) => {
    setConfig(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const updateSlide = (index: number, field: keyof BannerSlide, value: any) => {
    setConfig(prev => {
      if (!prev) return prev;
      const slides = [...prev.bannerSlides];
      slides[index] = { ...slides[index], [field]: value };
      return { ...prev, bannerSlides: slides };
    });
  };

  const addSlide = () => {
    const newSlide: BannerSlide = {
      id: Date.now().toString(),
      title: "Nouveau",
      subtitle: "",
      cta: "Acheter",
      image: "",
      bgColor: "from-blue-500 to-purple-600"
    };

    setConfig(prev =>
      prev ? { ...prev, bannerSlides: [...prev.bannerSlides, newSlide] } : prev
    );
  };

  const deleteSlide = (index: number) => {
    setConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        bannerSlides: prev.bannerSlides.filter((_, i) => i !== index)
      };
    });
  };

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await fetch("/api/config", {
        method: "POST",
        body: JSON.stringify(config),
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    config,
    setConfig,
    loading,
    saving,
    stats,
    updateField,
    updateSlide,
    addSlide,
    deleteSlide,
    save
  };
}