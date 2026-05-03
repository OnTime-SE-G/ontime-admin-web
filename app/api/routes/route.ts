import { NextRequest, NextResponse } from 'next/server';

const G2 = process.env.G2_BASE_URL ?? 'http://localhost:8000';

export async function GET() {
  try {
    const res = await fetch(`${G2}/api/v1/routes`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to reach backend' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const res = await fetch(`${G2}/api/v1/admin/routes/add-route`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to reach backend' }, { status: 502 });
  }
}
