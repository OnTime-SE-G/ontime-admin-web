import { NextRequest, NextResponse } from 'next/server';

const G2 = process.env.G2_BASE_URL ?? 'http://localhost:8000';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await fetch(`${G2}/api/v1/admin/fleet/buses/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to reach backend' }, { status: 502 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = req.nextUrl;
  const routeId = searchParams.get('routeId');
  if (!routeId) {
    return NextResponse.json({ error: 'routeId query param required' }, { status: 400 });
  }
  try {
    const res = await fetch(
      `${G2}/api/v1/admin/fleet/buses/${id}/assign-route/${routeId}`,
      { method: 'POST' }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to reach backend' }, { status: 502 });
  }
}
