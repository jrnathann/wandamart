"use client"

import { CheckCircle } from "lucide-react";

export default function CartToast({ 
  show, 
  productName 
}: { 
  show: boolean; 
  productName: string;
}) {
  return (
    <div
      className={`fixed top-8 right-8 bg-white border-2 border-green-500 rounded-xl shadow-2xl p-4 flex items-center gap-3 z-[100] transition-all duration-300 transform ${
        show ? 'translate-x-0 opacity-100' : 'translate-x-[400px] opacity-0'
      }`}
    >
      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-6 h-6 text-green-600" />
      </div>
      <div>
        <p className="font-semibold text-shopici-black">Ajouté au panier !</p>
        <p className="text-sm text-shopici-charcoal line-clamp-1">{productName}</p>
      </div>
    </div>
  );
}