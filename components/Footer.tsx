"use client"
import { Facebook, Mail, Phone, MapPin, ShoppingBag } from "lucide-react";
import { storeConfig } from "@/data/configData";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-shopici-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          {/* Brand Section */}
          <div className="space-y-4">

            <div className="flex items-center gap-2">
              <Image
                src="/logo2.png"
                alt="Shopici logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <h3 className="text-2xl font-bold">Shopici</h3>
            </div>
            <p className="text-shopici-gray text-sm leading-relaxed">
              Votre destination shopping en ligne au Cameroun. Des produits de qualité, livrés directement chez vous.
            </p>
            <div className="flex gap-3">
              <a
                href="https://web.facebook.com/profile.php?id=61582791245183"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-shopici-charcoal hover:bg-shopici-blue flex items-center justify-center transition-all duration-300 transform hover:scale-110"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Liens Rapides</h4>
            <ul className="space-y-2">
              <li>
                <a href="/products" className="text-shopici-gray hover:text-shopici-coral transition-colors duration-300 text-sm">
                  Nos Produits
                </a>
              </li>
              {/* <li>
                <a href="/" className="text-shopici-gray hover:text-shopici-coral transition-colors duration-300 text-sm">
                  Catégories
                </a>
              </li> */}
              <li>
                <a href="/about" className="text-shopici-gray hover:text-shopici-coral transition-colors duration-300 text-sm">
                  À Propos
                </a>
              </li>
              <li>
                <a href="/contact" className="text-shopici-gray hover:text-shopici-coral transition-colors duration-300 text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Service Client</h4>
            <ul className="space-y-2">
              <li>
                <a href="/shipping" className="text-shopici-gray hover:text-shopici-coral transition-colors duration-300 text-sm">
                  Suivre ma commande
                </a>
              </li>
              <li>
                <a href="/terms" className="text-shopici-gray hover:text-shopici-coral transition-colors duration-300 text-sm">
                  Conditions d'utilisation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-shopici-coral mt-0.5 flex-shrink-0" />
                <span className="text-shopici-gray">
                  {storeConfig.contact.address}
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-shopici-coral flex-shrink-0" />
                <a href="tel:+237" className="text-shopici-gray hover:text-shopici-coral transition-colors duration-300">
                  {storeConfig.contact.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-shopici-charcoal">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-shopici-gray text-sm">
              © {currentYear} Shopici. Tous droits réservés.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="/privacy" className="text-shopici-gray hover:text-shopici-coral transition-colors duration-300">
                Politique de confidentialité
              </a>
              <a href="/cookies" className="text-shopici-gray hover:text-shopici-coral transition-colors duration-300">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}