import { getAdminCatalog } from '../../../../lib/catalog';
import ProductsManager from '../../../../components/admin/ProductsManager';
import { getCurrentAdmin } from '../../../../lib/auth';
import { can } from '../../../../lib/roles';

export const metadata = { title: 'Products' };

export default async function AdminProductsPage() {
  const [{ categories, products }, me] = await Promise.all([getAdminCatalog(), getCurrentAdmin()]);
  return <ProductsManager initialProducts={products} categories={categories} canDelete={can(me, 'products.delete')} />;
}
