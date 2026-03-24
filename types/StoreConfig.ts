export type BannerSlide = {
  id: string; // Changed to string for DB compatibility
  title: string;
  subtitle: string;
  cta: string;
  image: string; // Cloudinary URL
  bgColor: string;
};

export type StoreConfigType = {
  _id?: string;
  name: string;
  logo: string;
  description: string;
  objective: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  currency: string;
  social: {
    facebook?: string;
    instagram?: string;
  };
  tracking: {
    facebookPixelId?: string;
    googleAnalyticsId?: string;
  };
  bannerSlides: BannerSlide[];
  theme: {
    colors: {
      black: string;
      blue: string;
      coral: string;
    };
  };
  features: {
    mobileMoneyPayment: boolean;
  };
};