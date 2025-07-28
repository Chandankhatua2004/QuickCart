import { dbConnect } from '@/lib/mongoose';
import Address from '@/models/Address';
// import { auth } from '@clerk/nextjs/server';

export async function GET(req) {
  await dbConnect();
  // const { userId } = auth();
  // if (!userId) {
  //   return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  // }
  const addresses = await Address.find(); // get all addresses for debugging
  return Response.json(addresses);
}

export async function POST(req) {
  await dbConnect();
  // const { userId } = auth();
  // if (!userId) {
  //   return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  // }
  const data = await req.json();
  // data.userId = userId; // Always set from Clerk
  const address = await Address.create(data);
  return Response.json(address);
} 