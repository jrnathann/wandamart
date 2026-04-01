// configData.ts

const bannerSlides = [
  {
    id: "1",
    title: "Nouveautés 2026",
    subtitle: "Découvrez nos derniers produits",
    cta: "Acheter Maintenant",
    image: "/banner1.png",
    bgColor: "from-blue-500 to-purple-600",
  },
  {
    id: "2",
    title: "Offres Spéciales",
    subtitle: "Jusqu'à 30% de réduction",
    cta: "Voir les Offres",
    image: "/banner2.png",
    bgColor: "from-orange-500 to-red-600",
  },
];
export const storeConfig = {
  name: "Shopici",
  logo: "/logo2.png",
  description: "Votre boutique en ligne pour tous vos besoins",
  objective: "Vous offrir une expérience d’achat simple, sécurisée et agréable, sans stress.",
  contact: {
    email: "contact@shopici.com",
    phone: "+237 6 22 57 13 96",
    address: "Yaoundé, Cameroun"
  },
  currency: "XAF",
  social: {
    facebook: "https://web.facebook.com/profile.php?id=61582791245183",
  },
  tracking: {
    facebookPixelId: "735596049606757",
    googleAnalyticsId: "G-EH6KJZMW7W",
  },
  bannerSlides,
  theme: {
    colors: {
      black: "#020202",
      blue: "#869FAD",
      coral: "#fe6448",
    }
  },
    features: {
    mobileMoneyPayment: true,
  },
};


