import { getAdminCatalog } from '../../../../lib/catalog';
import CategoriesManager from '../../../../components/admin/CategoriesManager';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '../../../../lib/auth';
import { can } from '../../../../lib/roles';

export const metadata = { title: 'Categories' };

export default async function AdminCategoriesPage() {
  if (!can(await getCurrentAdmin(), 'categories.manage')) redirect('/admin');
  const { categories, products } = await getAdminCatalog();
  const productCounts = {};
  for (const p of products) productCounts[p.categoryId] = (productCounts[p.categoryId] || 0) + 1;
  return <CategoriesManager initialCategories={categories} productCounts={productCounts} />;
}
