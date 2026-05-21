import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Resource from '@/lib/db/models/Resource';
import { getSession, requireRole, createAuditLog } from '@/lib/auth/session';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET /api/resources - List resources
// Public: returns published+public resources
// Partner user: also returns their own private/draft resources
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const visibility = searchParams.get('visibility');
    const partnerId = searchParams.get('partnerId');
    const mine = searchParams.get('mine'); // "true" = only my resources
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'recent'; // recent | downloads | title

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    // If Partner requesting their own resources
    if (mine === 'true' && session && session.role === 'partner') {
      query.partnerId = session.userId;
      if (status) query.status = status;
      if (visibility) query.visibility = visibility;
    } else {
      // Public listing: only published + public
      query.status = 'published';
      query.visibility = 'public';
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (partnerId && mine !== 'true') {
      query.partnerId = partnerId;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'downloads') sortObj = { downloadCount: -1 };
    if (sort === 'title') sortObj = { title: 1 };

    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      Resource.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      Resource.countDocuments(query),
    ]);

    return NextResponse.json({
      resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/resources error:', error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

// POST /api/resources - Partner uploads a new resource
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ['partner', 'admin']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const visibility = (formData.get('visibility') as string) || 'public';
    const status = (formData.get('status') as string) || 'draft';
    const tags = formData.get('tags') as string; // comma-separated
    const file = formData.get('file') as File | null;

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Get Partner user info for denormalized name
    const User = (await import('@/lib/db/models/User')).default;
    const partnerUser = await User.findById(auth.session!.userId).select('name');
    const partnerName = partnerUser?.name || 'Unknown Partner';

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'uploads', 'resources');
    await mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);

    await writeFile(filePath, buffer);

    const resource = await Resource.create({
      title,
      description,
      fileName: file.name,
      filePath: filePath,
      fileSize: file.size,
      mimeType: file.type,
      category,
      tags: tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      partnerId: auth.session!.userId,
      partnerName,
      visibility,
      status,
    });

    await createAuditLog(
      auth.session!.userId,
      'resource_upload',
      'resource',
      `Uploaded resource: ${title}`,
      { resourceId: resource._id.toString(), category, visibility },
      request
    );

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    console.error('POST /api/resources error:', error);
    return NextResponse.json({ error: 'Failed to upload resource' }, { status: 500 });
  }
}
