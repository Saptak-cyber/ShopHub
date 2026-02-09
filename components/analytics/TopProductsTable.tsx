import { Card } from "../ui/Card";
import Image from "next/image";

interface TopProduct {
  productId: string;
  name: string;
  imageUrl?: string;
  category?: string;
  quantitySold: number;
  revenue: number;
}

interface TopProductsTableProps {
  products: TopProduct[];
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Top Selling Products</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Rank</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Product</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Category</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Units Sold</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.productId} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    index === 1 ? 'bg-zinc-500/20 text-zinc-400' :
                    index === 2 ? 'bg-amber-700/20 text-amber-400' :
                    'bg-zinc-800 text-zinc-500'
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {product.imageUrl && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-zinc-400">{product.category || 'N/A'}</td>
                <td className="py-4 px-4 text-right font-medium">{product.quantitySold}</td>
                <td className="py-4 px-4 text-right font-semibold text-green-400">
                  ${product.revenue.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="py-12 text-center text-zinc-500">
            No sales data available
          </div>
        )}
      </div>
    </Card>
  );
}
