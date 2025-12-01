import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient, DatabaseClient } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const email = searchParams.get('email');
  
  try {
    const prisma = await getPrismaClient() as DatabaseClient | null;
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }
    
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          preferences: true,
          songEEGScores: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json({ user });
    }
    
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          preferences: true,
        },
      });
      
      return NextResponse.json({ user });
    }
    
    return NextResponse.json({ error: 'userId or email is required' }, { status: 400 });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, likedGenres, dislikedGenres } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }
    
    const prisma = await getPrismaClient() as DatabaseClient | null;
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }
    
    // Create or update user
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name,
        preferences: {
          create: {
            likedGenres: likedGenres || [],
            dislikedGenres: dislikedGenres || [],
          },
        },
      },
      update: {
        name,
      },
      include: {
        preferences: true,
      },
    });
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Failed to create/update user:', error);
    return NextResponse.json(
      { error: 'Failed to create/update user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, likedGenres, dislikedGenres } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    
    const prisma = await getPrismaClient() as DatabaseClient | null;
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }
    
    // Update preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        likedGenres: likedGenres || [],
        dislikedGenres: dislikedGenres || [],
      },
      update: {
        likedGenres: likedGenres,
        dislikedGenres: dislikedGenres,
      },
    });
    
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Failed to update preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
