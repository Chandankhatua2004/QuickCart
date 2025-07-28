import { dbConnect } from '@/lib/mongoose';
import Order from '@/models/Order';

export async function PATCH(req, { params }) {
  await dbConnect();
  const { id } = params;
  const data = await req.json();
  const order = await Order.findByIdAndUpdate(id, data, { new: true });
  if (!order) {
    return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
  }
  return Response.json(order);
} 