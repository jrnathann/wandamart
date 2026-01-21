// src/data/products.ts
// Single-file setup: Product type + products array (no backend required)

import { Product } from "@/types/Product";

export const products: Product[] = [
  {
    _id: "prod_001",
    slug: "electric-hair-trimmer",
    name: "Tondeuse Électrique Professionnelle",
    description:
      "Tondeuse puissante et durable pour cheveux et barbe. Batterie longue durée et coupe précise. Idéale pour un usage professionnel ou personnel. Lames en acier inoxydable pour une coupe nette et durable.",
    shortDescription: "Coupe nette, batterie longue durée",

    price: 18000,
    compareAtPrice: 22000,
    currency: "XAF",

    images: [
      { id: "img1", url: "https://www.cdiscount.com/pdt2/2/9/1/1/700x700/bil0764047707291/rw/tondeuse-electrique-professionnelle-pour-barbe-ap.jpg", alt: "Tondeuse électrique vue de face" },
      { id: "img2", url: "https://ci.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/82/622613/1.jpg?4164", alt: "Tondeuse électrique détails" },
    ],

    category: "Beauté & Soins",
    tags: ["tondeuse", "beauté", "homme", "barbier"],

    stock: 24,
    isAvailable: true,

    testimonials: [
      {
        id: "wa_001",
        imageUrl: "https://images.squarespace-cdn.com/content/v1/5ac57ebea2772ca645cabb12/1583722839765-HFZ7FQBZWGKHRL3LWM7C/image-asset.jpeg",
        city: "Douala",
      },
      {
        id: "wa_002",
        imageUrl: "https://images.squarespace-cdn.com/content/v1/5ac57ebea2772ca645cabb12/1525619194376-GH5ZPBHR729F1Z8HHQ95/28166507_1641375372582161_1773831006460536145_n.jpg",
        city: "Yaoundé",
      },
    ],

    delivery: {
      available: true,
      areas: ["Douala", "Yaoundé", "Bafoussam", "Nationwide"],
      estimatedDays: "1–2 jours",
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    _id: "prod_002",
    slug: "wireless-bluetooth-headphones",
    name: "Casque Bluetooth Sans Fil Premium",
    description:
      "Casque audio Bluetooth avec réduction de bruit active. Son haute définition, confort optimal pour des heures d'écoute. Autonomie de 30 heures. Compatible avec tous les appareils.",
    shortDescription: "Son HD, 30h d'autonomie",

    price: 25000,
    compareAtPrice: 35000,
    currency: "XAF",

    images: [
      { id: "img1", url: "https://media.s-bol.com/NRO1Dl7P57P2/JOy0Ky/550x614.jpg", alt: "Casque Bluetooth noir" },
      { id: "img2", url: "https://m.media-amazon.com/images/I/51e6JUfWZNL._AC_SL1500_.jpg", alt: "Casque pliable" },
    ],

    category: "Électronique",
    tags: ["casque", "bluetooth", "audio", "musique"],

    stock: 15,
    isAvailable: true,

    testimonials: [
      {
        id: "wa_003",
        imageUrl: "https://images.squarespace-cdn.com/content/v1/5ac57ebea2772ca645cabb12/1583722839765-HFZ7FQBZWGKHRL3LWM7C/image-asset.jpeg",
        city: "Yaoundé",
      },
    ],

    delivery: {
      available: true,
      areas: ["Douala", "Yaoundé", "Bafoussam", "Nationwide"],
      estimatedDays: "1–3 jours",
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    _id: "prod_003",
    slug: "smartwatch-fitness-tracker",
    name: "Montre Connectée Fitness Tracker",
    description:
      "Montre intelligente avec suivi d'activité, moniteur de fréquence cardiaque, compteur de pas, calories brûlées. Étanche IP68. Notifications smartphone. Écran tactile haute résolution.",
    shortDescription: "Suivi fitness complet, étanche",

    price: 22000,
    compareAtPrice: 30000,
    currency: "XAF",

    images: [
      { id: "img1", url: "https://m.media-amazon.com/images/I/61ZjlBOp+rL._AC_SL1500_.jpg", alt: "Smartwatch noir" },
    ],

    category: "Électronique",
    tags: ["montre", "fitness", "sport", "santé"],

    stock: 8,
    isAvailable: true,
    isFeatured: true,
    delivery: {
      available: true,
      areas: ["Douala", "Yaoundé", "Nationwide"],
      estimatedDays: "2–3 jours",
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    _id: "prod_004",
    slug: "led-desk-lamp",
    name: "Lampe de Bureau LED Rechargeable",
    description:
      "Lampe de bureau moderne avec 3 niveaux de luminosité. Rechargeable via USB, autonomie de 8 heures. Bras flexible à 360°. Protection des yeux. Parfaite pour étudier ou travailler.",
    shortDescription: "3 niveaux, rechargeable USB",

    price: 12000,
    compareAtPrice: 16000,
    currency: "XAF",

    images: [
      { id: "img1", url: "https://m.media-amazon.com/images/I/61VKIJMJsJL._AC_SL1500_.jpg", alt: "Lampe LED blanche" },
    ],

    category: "Maison & Bureau",
    tags: ["lampe", "led", "bureau", "étude"],

    stock: 30,
    isAvailable: true,

    delivery: {
      available: true,
      areas: ["Douala", "Yaoundé", "Bafoussam", "Nationwide"],
      estimatedDays: "1–2 jours",
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    _id: "prod_005",
    slug: "portable-power-bank-20000mah",
    name: "Batterie Externe 20000mAh Ultra Rapide",
    description:
      "Power bank haute capacité 20000mAh. Charge rapide 18W. 2 ports USB + 1 port USB-C. Indicateur LED. Compatible avec tous smartphones et tablettes. Sécurité anti-surchauffe.",
    shortDescription: "20000mAh, charge rapide",

    price: 15000,
    compareAtPrice: 20000,
    currency: "XAF",

    images: [
      { id: "img1", url: "https://m.media-amazon.com/images/I/61IBBVJvSDL._AC_SL1500_.jpg", alt: "Power bank noir" },
    ],

    category: "Électronique",
    tags: ["batterie", "powerbank", "chargeur", "portable"],

    stock: 45,
    isAvailable: true,

    delivery: {
      available: true,
      areas: ["Douala", "Yaoundé", "Bafoussam", "Nationwide"],
      estimatedDays: "1–2 jours",
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    _id: "prod_006",
    slug: "anti-aging-face-cream",
    name: "Crème Visage Anti-Âge Premium",
    description:
      "Crème de jour et nuit enrichie en vitamine C et acide hyaluronique. Réduit les rides, hydrate en profondeur. Pour tous types de peaux. Résultats visibles en 2 semaines. 50ml.",
    shortDescription: "Anti-rides, vitamine C",

    price: 18000,
    compareAtPrice: 25000,
    currency: "XAF",

    images: [
      { id: "img1", url: "https://m.media-amazon.com/images/I/71Rxa+TkYnL._SL1500_.jpg", alt: "Crème visage" },
    ],

    category: "Beauté & Soins",
    tags: ["crème", "beauté", "anti-âge", "soin"],

    stock: 20,
    isAvailable: true,

    testimonials: [
      {
        id: "wa_004",
        imageUrl: "https://images.squarespace-cdn.com/content/v1/5ac57ebea2772ca645cabb12/1583722839765-HFZ7FQBZWGKHRL3LWM7C/image-asset.jpeg",
        city: "Douala",
      },
      {
        id: "wa_005",
        imageUrl: "https://images.squarespace-cdn.com/content/v1/5ac57ebea2772ca645cabb12/1525619194376-GH5ZPBHR729F1Z8HHQ95/28166507_1641375372582161_1773831006460536145_n.jpg",
        city: "Bafoussam",
      },
    ],

    delivery: {
      available: true,
      areas: ["Douala", "Yaoundé", "Bafoussam", "Nationwide"],
      estimatedDays: "1–2 jours",
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    _id: "prod_007",
    slug: "yoga-mat-premium",
    name: "Tapis de Yoga Premium Antidérapant",
    description:
      "Tapis de yoga épais 6mm, antidérapant des deux côtés. Matériau écologique non toxique. Dimensions: 183cm x 61cm. Sac de transport inclus. Parfait pour yoga, pilates, fitness.",
    shortDescription: "6mm épais, avec sac",

    price: 14000,
    compareAtPrice: 18000,
    currency: "XAF",

    images: [
      { id: "img1", url: "https://m.media-amazon.com/images/I/81P9v2QhOcL._AC_SL1500_.jpg", alt: "Tapis de yoga violet" },
    ],

    category: "Sport & Fitness",
    tags: ["yoga", "sport", "fitness", "tapis"],

    stock: 12,
    isAvailable: true,

    delivery: {
      available: true,
      areas: ["Douala", "Yaoundé", "Nationwide"],
      estimatedDays: "2–3 jours",
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    _id: "prod_008",
    slug: "wireless-gaming-mouse",
    name: "Souris Gamer Sans Fil RGB",
    description:
      "Souris gaming haute précision 3200 DPI réglable. 7 boutons programmables. Éclairage RGB personnalisable. Autonomie 40 heures. Compatible PC et Mac. Ergonomique pour longues sessions.",
    shortDescription: "3200 DPI, RGB, 7 boutons",

    price: 16000,
    currency: "XAF",

    images: [
      { id: "img1", url: "https://m.media-amazon.com/images/I/61mpMH5TzkL._AC_SL1001_.jpg", alt: "Souris gaming RGB" },
    ],

    category: "Électronique",
    tags: ["souris", "gaming", "ordinateur", "rgb"],

    stock: 18,
    isAvailable: true,

    delivery: {
      available: true,
      areas: ["Douala", "Yaoundé", "Bafoussam", "Nationwide"],
      estimatedDays: "1–2 jours",
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    _id: "prod_009",
    slug: "stainless-steel-water-bottle",
    name: "Gourde Isotherme Inox 750ml",
    description:
      "Bouteille isotherme en acier inoxydable. Garde le chaud 12h et le froid 24h. Sans BPA. Étanche 100%. Design élégant. Parfaite pour sport, travail, voyage.",
    shortDescription: "Isotherme 24h, inox",

    price: 9000,
    compareAtPrice: 12000,
    currency: "XAF",

    images: [
      { id: "img1", url: "https://m.media-amazon.com/images/I/51U8SUWWS0L._AC_SL1200_.jpg", alt: "Gourde inox bleue" },
    ],

    category: "Sport & Fitness",
    tags: ["gourde", "bouteille", "isotherme", "sport"],

    stock: 35,
    isAvailable: true,

    delivery: {
      available: true,
      areas: ["Douala", "Yaoundé", "Bafoussam", "Nationwide"],
      estimatedDays: "1–2 jours",
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    _id: "prod_010",
    slug: "kitchen-knife-set",
    name: "Set de Couteaux de Cuisine Professionnels",
    description:
      "Ensemble de 5 couteaux professionnels en acier inoxydable. Lames ultra-tranchantes. Manches ergonomiques. Bloc en bois inclus. Parfait pour tous types de découpe.",
    shortDescription: "5 couteaux + bloc bois",

    price: 28000,
    compareAtPrice: 35000,
    currency: "XAF",

    images: [
      { id: "img1", url: "https://m.media-amazon.com/images/I/71z1ZqXHwiL._AC_SL1500_.jpg", alt: "Set de couteaux" },
    ],

    category: "Maison & Bureau",
    tags: ["couteaux", "cuisine", "ustensiles"],

    stock: 10,
    isAvailable: true,

    delivery: {
      available: true,
      areas: ["Douala", "Yaoundé", "Nationwide"],
      estimatedDays: "2–3 jours",
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    _id: "prod_011",
    slug: "resistance-bands-set",
    name: "Kit Bandes de Résistance Fitness",
    description:
      "Set complet de 5 bandes élastiques de résistance. Différents niveaux de tension. Poignées confortables. Sac de transport inclus. Idéal pour musculation à domicile.",
    shortDescription: "5 bandes, tous niveaux",

    price: 11000,
    compareAtPrice: 15000,
    currency: "XAF",

    images: [
      { id: "img1", url: "https://m.media-amazon.com/images/I/71XNEhJ3CqL._AC_SL1500_.jpg", alt: "Bandes de résistance" },
    ],

    category: "Sport & Fitness",
    tags: ["fitness", "musculation", "élastiques", "sport"],

    stock: 25,
    isAvailable: true,

    delivery: {
      available: true,
      areas: ["Douala", "Yaoundé", "Bafoussam", "Nationwide"],
      estimatedDays: "1–2 jours",
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    _id: "prod_012",
    slug: "air-fryer-digital",
    name: "Friteuse à Air Chaud Digitale 5L",
    description:
      "Friteuse sans huile 1500W. Capacité 5 litres. 8 programmes de cuisson. Écran tactile LED. Cuisson saine et rapide. Panier antiadhésif facile à nettoyer.",
    shortDescription: "Sans huile, 5L, 8 programmes",

    price: 45000,
    compareAtPrice: 60000,
    currency: "XAF",

    images: [
      { id: "img1", url: "https://m.media-amazon.com/images/I/71riQZ5qC4L._AC_SL1500_.jpg", alt: "Air fryer noir" },
    ],

    category: "Maison & Bureau",
    tags: ["friteuse", "cuisine", "électroménager"],

    stock: 7,
    isAvailable: true,

    delivery: {
      available: true,
      areas: ["Douala", "Yaoundé", "Nationwide"],
      estimatedDays: "2–4 jours",
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper functions
export const getProductBySlug = (slug: string): Product | undefined =>
  products.find((p) => p.slug === slug);

export const getAllProducts = (): Product[] => products;

export const getProductsByCategory = (category: string): Product[] =>
  products.filter((p) => p.category === category);

export const getFeaturedProducts = (limit: number = 4): Product[] =>
  products.filter(p => p.isAvailable && p.isFeatured).slice(0, limit);

export const getRelatedProducts = (productId: string, limit: number = 4): Product[] => {
  const product = products.find((p) => p._id === productId);
  if (!product) return [];

  return products
    .filter((p) => p.category === product.category && p._id !== productId && p.isAvailable)
    .slice(0, limit);
};