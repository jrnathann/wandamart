import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";


export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  try {
    const product = await Product.findOne({ slug });
    if (!product)
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la récupération du produit" }, { status: 500 });
  }
}
