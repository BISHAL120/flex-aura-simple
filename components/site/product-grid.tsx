import { Container } from "@/components/site/container"
import { ProductCard } from "@/components/site/product-card"
import { type Product } from "@/lib/data"

export function ProductGrid({
  products,
  priority = false,
}: {
  products: Product[]
  priority?: boolean
}) {
  return (
    <Container>
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={priority && index < 4}
          />
        ))}
      </div>
    </Container>
  )
}
