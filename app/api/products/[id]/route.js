import { dbConnect } from '@/lib/mongoose';
import Product from '@/models/Product';

export async function DELETE(req, { params }) {
  await dbConnect();
  const { id } = params;
  
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }
    return Response.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete product' }), { status: 500 });
  }
} 