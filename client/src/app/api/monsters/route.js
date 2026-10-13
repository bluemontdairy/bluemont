import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Monster from '../../../models/Monster';
import { authorize } from '../../../lib/auth';
import { builtInMonsters, getAllMonsters, monsterInput, refreshMonsters, serializeMonster } from '../../../lib/monsters';
import { getSiteMedia } from '../../../lib/siteMedia';
import { denied, handleError } from '../../../lib/apiResponse';

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
// monsters in so they can be edited; only allowed while there are none.
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
      const rows = builtInMonsters(await getSiteMedia()).map((m) => ({ ...monsterInput(m), updatedBy: auth.admin.username }));
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
