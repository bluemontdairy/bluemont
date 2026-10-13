import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '../../../../lib/auth';
import { can } from '../../../../lib/roles';
import { getAllMonsters } from '../../../../lib/monsters';
import MonstersManager from '../../../../components/admin/MonstersManager';

export const metadata = { title: 'Monsters' };

export default async function MonstersPage() {
  const me = await getCurrentAdmin();
  if (!can(me, 'monsters.edit')) redirect('/admin');
  return <MonstersManager initialMonsters={await getAllMonsters()} canDelete={can(me, 'monsters.delete')} />;
}
