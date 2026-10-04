import { getAllProducts } from '../../../../lib/catalog';
import ProductsManager from '../../../../components/admin/ProductsManager';

export const metadata = { title: 'Products' };

export default async function AdminProductsPage() {
  const products = await getAllProducts();
  return <ProductsManager initialProducts={products} />;
}
