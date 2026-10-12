import connectDB from '../../../../lib/db';
import Contact from '../../../../models/Contact';
import MessagesManager from '../../../../components/admin/MessagesManager';
import { getCurrentAdmin } from '../../../../lib/auth';
import { can } from '../../../../lib/roles';

export const metadata = { title: 'Messages' };

export default async function AdminMessagesPage() {
  await connectDB();
  const messages = await Contact.find().sort({ createdAt: -1 }).lean();
  const plain = messages.map((m) => ({
    _id: String(m._id),
    name: m.name,
    email: m.email || '',
    phone: m.phone,
    message: m.message,
    isRead: m.isRead,
    createdAt: m.createdAt.toISOString(),
  }));
  return <MessagesManager initialMessages={plain} canDelete={can(await getCurrentAdmin(), 'messages.delete')} />;
}
