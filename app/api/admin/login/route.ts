import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { email, password } = await req.json();
    const adminEmail = process.env.ADMIN_EMAIL || 'youseffahmed74@proton.me';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2024!';

    let isValid = false;
    if (email === adminEmail && password === adminPassword) {
      isValid = true;
      const existing = await User.findOne({ email });
      if (!existing) {
        await User.create({ name: 'Admin', email, password, role: 'admin' });
      }
    } else {
      const user = await User.findOne({ email, role: 'admin' });
      if (user && await user.comparePassword(password)) isValid = true;
    }

    if (!isValid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const token = Buffer.from(`${email}:${Date.now()}:nova`).toString('base64');
    return NextResponse.json({ token, email });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
