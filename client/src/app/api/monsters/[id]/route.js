import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Monster from '../../../../models/Monster';
import { authorize } from '../../../../lib/auth';
import { destroyAsset } from '../../../../lib/cloudinary';
import { monsterInput, refreshMonsters, serializeMonster } from '../../../../lib/monsters';
import { denied, handleError, notFound } from '../../../../lib/apiResponse';

// Deletes Cloudinary uploads the monster no longer uses.
async function dropReplaced(previous, current = {}) {
  if (previous.imagePublicId && previous.imagePublicId !== current.imagePublicId) await destroyAsset(previous.imagePublicId);
  if (previous.scoopImagePublicId && previous.scoopImagePublicId !== current.scoopImagePublicId) await destroyAsset(previous.scoopImagePublicId);
}

export async function PUT(request, { params }) {
  try {
    const auth = await authorize(request, 'monsters.edit');
    if (!auth.admin) return denied(auth);
    const { id } = await params;
    const input = monsterInput(await request.json());

    await connectDB();
    const previous = await Monster.findById(id).lean();
    if (!previous) return notFound();
    const monster = await Monster.findByIdAndUpdate(id, { ...input, updatedBy: auth.admin.username }, { new: true, runValidators: true }).lean();
    await dropReplaced(previous, monster);
    refreshMonsters();
    return NextResponse.json(serializeMonster(monster));
  } catch (error) {
    return handleError(error);
  }
}

// Partial update for the show/hide toggle and reordering.
export async function PATCH(request, { params }) {
  try {
    const auth = await authorize(request, 'monsters.edit');
    if (!auth.admin) return denied(auth);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    await connectDB();
    const monster = await Monster.findById(id);
    if (!monster) return notFound();
    if (typeof body.isActive === 'boolean') monster.isActive = body.isActive;
    if (Number.isFinite(body.sortOrder)) monster.sortOrder = body.sortOrder;
    monster.updatedBy = auth.admin.username;
    await monster.save();
    refreshMonsters();
    return NextResponse.json(serializeMonster(monster.toObject()));
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authorize(request, 'monsters.delete');
    if (!auth.admin) return denied(auth);
    const { id } = await params;

    await connectDB();
    const monster = await Monster.findByIdAndDelete(id);
    if (!monster) return notFound();
    await dropReplaced(monster);
    refreshMonsters();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
