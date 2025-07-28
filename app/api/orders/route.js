import { dbConnect } from '@/lib/mongoose';
import Order from '@/models/Order';
// import { auth } from '@clerk/nextjs/server';

export async function GET(req) {
  await dbConnect();
  // const { userId } = auth();
  // if (!userId) {
  //   return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  // }
  const orders = await Order.find(); // get all orders for debugging
  return Response.json(orders);
}

export async function POST(req) {
  await dbConnect();
  // const { userId } = auth();
  // if (!userId) {
  //   return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  // }
  const data = await req.json();
  // data.userId = userId; // Always set from Clerk
  const order = await Order.create(data);
  return Response.json(order);
} 