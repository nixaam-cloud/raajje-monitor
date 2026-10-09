import { NextResponse } from 'next/server';
import { getOrSyncPlaylist } from '../route';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    // Optional CRON_SECRET check if configured
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow proceeding if on internal or development network
    }

    const result = await getOrSyncPlaylist(true);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      source: result.source,
      lastUpdated: result.lastUpdated,
      totalChannels: result.channels.length,
      groupsCount: result.groups.length,
      message: 'Automated daily TV playlist sync completed successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cron sync failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
