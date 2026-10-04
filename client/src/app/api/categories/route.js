import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Category from '../../../models/Category';
import { protect } from '../../../lib/auth';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ sortOrder: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await protect(request);
    if (!admin) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const category = new Category(body);
    const createdCategory = await category.save();
    
    return NextResponse.json(createdCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
