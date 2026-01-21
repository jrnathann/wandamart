import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/requireAdmin";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
/* ---------------------------------------------
 * GET - Fetch a single product by ID
 * -------------------------------------------*/
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();

  try {
    const product = await Product.findById(id);
    if (!product)
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du produit" },
      { status: 500 }
    );
  }
}

/* ---------------------------------------------
 * PATCH - Update a product by ID
 * -------------------------------------------*/
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  await connectDB();
  
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!updatedProduct)
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le produit" },
      { status: 500 }
    );
  }
}

/* ---------------------------------------------
 * DELETE - Remove a product by ID
 * -------------------------------------------*/
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();
  
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct)
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );

    // Delete main product images
    if (deletedProduct.images?.length) {
      for (const img of deletedProduct.images) {
        if (img.id) {
          try {
            await cloudinary.uploader.destroy(img.id);
          } catch (err) {
            console.error(`Failed to delete image ${img.id}:`, err);
          }
        }
      }
    }

    // Delete testimonial images
    if (deletedProduct.testimonials?.length) {
      for (const testimonial of deletedProduct.testimonials) {
        if (testimonial.id) {
          try {
            await cloudinary.uploader.destroy(testimonial.id);
          } catch (err) {
            console.error(
              `Failed to delete testimonial image ${testimonial.id}:`,
              err
            );
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Produit et toutes les images supprimés avec succès",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Impossible de supprimer le produit" },
      { status: 500 }
    );
  }
} 