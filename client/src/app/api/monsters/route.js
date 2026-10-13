import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Monster from '../../../models/Monster';
import { authorize } from '../../../lib/auth';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getAllMonsters, monsterInput, refreshMonsters, serializeMonster } from '../../../lib/monsters';
import { builtInMonsterRecords } from '../../../lib/monsterSeed';
import { getSiteMedia } from '../../../lib/siteMedia';
import { getCloudinary } from '../../../lib/cloudinary';
import { isCloudinaryUrl } from '../../../lib/media';
import { denied, handleError } from '../../../lib/apiResponse';

// Importing the built-in monsters uploads 14 files to Cloudinary.
export const maxDuration = 60;

// Admins only: every monster, hidden ones included. The homepage reads them
// directly (lib/monsters.js).
export async function GET(request) {
  try {
    const auth = await authorize(request, 'monsters.edit');
    if (!auth.admin) return denied(auth);
    return NextResponse.json(await getAllMonsters());
  } catch (error) {
    return handleError(error);
  }
}

// Adds a monster. { importBuiltIn: true } instead copies the built-in
// monsters in (pictures and scoops uploaded to Cloudinary) so they can be
// edited; only allowed while there are none.
export async function POST(request) {
  try {
    const auth = await authorize(request, 'monsters.edit');
    if (!auth.admin) return denied(auth);
    const body = await request.json().catch(() => ({}));
    await connectDB();

    if (body.importBuiltIn === true) {
      if ((await Monster.countDocuments()) > 0) {
        return NextResponse.json({ message: 'Monsters have already been added.' }, { status: 409 });
      }
      const media = await getSiteMedia();
      const { client, folder } = await getCloudinary();
      // The picture currently in each monster's site image slot. Built-in
      // files are read from disk where they exist (dev) and fetched from the
      // live site otherwise.
      const pictureSource = (key) => {
        const src = media[key]?.src || '';
        if (isCloudinaryUrl(src)) return src;
        const file = path.join(process.cwd(), 'public', src);
        return existsSync(file) ? file : new URL(src, request.url).href;
      };
      const rows = await builtInMonsterRecords({ cloudinary: client, folder, pictureSource, updatedBy: auth.admin.username });
      await Monster.insertMany(rows);
      refreshMonsters();
      return NextResponse.json(await getAllMonsters(), { status: 201 });
    }

    const monster = await Monster.create({ ...monsterInput(body), updatedBy: auth.admin.username });
    refreshMonsters();
    return NextResponse.json(serializeMonster(monster.toObject()), { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
