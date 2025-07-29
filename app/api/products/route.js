import { dbConnect } from '@/lib/mongoose';
import Product from '@/models/Product';

export async function GET(req) {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected successfully');
    
    const { search } = Object.fromEntries(new URL(req.url).searchParams);
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    console.log('Fetching products from database...');
    const products = await Product.find(query).sort({ createdAt: -1 });
    console.log(`Found ${products.length} products`);
    
    return Response.json(products);
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch products',
      details: error.message 
    }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected successfully');
    
    const formData = await req.formData();
    console.log('Form data received');
    
    const productData = {
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      price: parseFloat(formData.get('price')),
      offerPrice: parseFloat(formData.get('offerPrice')),
      image: []
    };

    console.log('Product data:', productData);

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

    console.log('Creating product with data:', productData);
    const product = await Product.create(productData);
    console.log('Product created successfully:', product._id);
    
    return Response.json(product);
  } catch (error) {
    console.error('Error in POST /api/products:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create product',
      details: error.message 
    }), { status: 500 });
  }
} 