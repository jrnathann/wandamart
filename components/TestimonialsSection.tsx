import { MapPin, CheckCircle } from "lucide-react";
import { Product } from "@/types/Product";
import { CldImage } from "next-cloudinary";

interface TestimonialsSectionProps {
    testimonials: Product["testimonials"];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
    if (!testimonials || testimonials.length === 0) return null;

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-shopici-black mb-6 text-center">
                Nos clients satisfaits partout au Cameroun
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="relative group">
                        <div className="aspect-square bg-gradient-to-br from-shopici-gray to-shopici-blue/20 rounded-xl overflow-hidden">
                            <CldImage
                                src={testimonial.imageUrl}
                                alt={`Client de ${testimonial.city}`}
                                fill
                                sizes="(max-width: 768px) 15vw, 8vw"
                                className="object-cover"
                            />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 rounded-b-xl">
                            <p className="text-white font-semibold text-sm flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {testimonial.city}
                            </p>
                        </div>
                        <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-center text-sm text-[#414141] mt-4">
                Plus de 500+ clients satisfaits à travers le Cameroun
            </p>
        </div>
    );
}