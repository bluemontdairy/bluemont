import mongoose from 'mongoose';
import connectDB from '../../../lib/db';
import Media from '../../../models/Media';

// Serves images uploaded from the admin panel. Each upload gets a new id, so
// responses can be cached forever.
export async function GET(request, { params }) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return new Response('Not found', { status: 404 });

  await connectDB();
  const media = await Media.findById(id).lean();
  if (!media) return new Response('Not found', { status: 404 });

  return new Response(media.data.buffer ? Buffer.from(media.data.buffer) : media.data, {
    headers: {
      'Content-Type': media.contentType,
      'Content-Length': String(media.size),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
