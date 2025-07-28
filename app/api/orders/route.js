import { dbConnect } from '@/lib/mongoose';
import Order from '@/models/Order';
// import { auth } from '@clerk/nextjs/server';

export async function GET(req) {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected successfully');
    
    // const { userId } = auth();
    // if (!userId) {
    //   return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    // }
    
    console.log('Fetching orders from database...');
    const orders = await Order.find(); // get all orders for debugging
    console.log(`Found ${orders.length} orders`);
    
    return Response.json(orders);
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch orders',
      details: error.message 
    }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected successfully');
    
    // const { userId } = auth();
    // if (!userId) {
    //   return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    // }
    
    const data = await req.json();
    console.log('Creating order with data:', data);
    
    // data.userId = userId; // Always set from Clerk
    const order = await Order.create(data);
    console.log('Order created successfully:', order._id);
    
    return Response.json(order);
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create order',
      details: error.message 
    }), { status: 500 });
  }
} 