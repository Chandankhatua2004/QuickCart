import { dbConnect } from '@/lib/mongoose';
import Product from '@/models/Product';

export async function GET(req) {
  await dbConnect();
  const products = await Product.find().sort({ createdAt: -1 });
  return Response.json(products);
}

export async function POST(req) {
  await dbConnect();
  
  try {
    const formData = await req.formData();
    
    const productData = {
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      price: parseFloat(formData.get('price')),
      offerPrice: parseFloat(formData.get('offerPrice')),
      image: []
    };

    // Handle image files (for now, we'll store placeholder URLs)
    // In a real application, you'd upload these to a cloud storage service
    for (let i = 0; i < 4; i++) {
      const imageFile = formData.get(`image${i}`);
      if (imageFile) {
        // For now, we'll use a placeholder image
        // In production, you'd upload to cloud storage and get the URL
        productData.image.push('/placeholder-image.jpg');
      }
    }

    // If no images were uploaded, add a default placeholder
    if (productData.image.length === 0) {
      productData.image.push('/placeholder-image.jpg');
    }

    const product = await Product.create(productData);
    return Response.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return new Response(JSON.stringify({ error: 'Failed to create product' }), { status: 500 });
  }
} 