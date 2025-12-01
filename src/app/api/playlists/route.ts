import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }
  
  try {
    const playlists = await prisma.generatedPlaylist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ playlists });
  } catch (error) {
    console.error('Failed to fetch playlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, context, songs } = body;
    
    if (!userId || !context || !songs) {
      return NextResponse.json(
        { error: 'userId, context, and songs are required' },
        { status: 400 }
      );
    }
    
    // Create the playlist
    const playlist = await prisma.generatedPlaylist.create({
      data: {
        userId,
        context,
        songs,
      },
    });
    
    // Record context history
    await prisma.userContextHistory.create({
      data: {
        userId,
        context,
      },
    });
    
    return NextResponse.json({ playlist });
  } catch (error) {
    console.error('Failed to create playlist:', error);
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    );
  }
}
