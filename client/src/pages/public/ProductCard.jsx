
import { useState } from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false);

  const image =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    (typeof product.images?.[0] === 'string'
      ? product.images[0]
      : '');

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-lg">

      {/* Product Image */}
      <div className="flex h-52 items-center justify-center overflow-hidden bg-emerald-50">

        {image && !imageError ? (
          <img
            src={image}
            alt={product.images?.find((img) => img.isPrimary)?.alt || product.name}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-6xl">🛍️</span>
        )}

      </div>

      {/* Product Information */}
      <div className="p-4">

        <p className="text-sm text-emerald-600">
          {product.category}
        </p>

        <h3 className="mt-2 text-lg font-semibold">
          {product.name}
        </h3>

        <p className="mt-3 text-xl font-bold text-emerald-600">
          ৳{Number(product.price).toLocaleString('en-BD')}
        </p>

        <p className="mt-2 text-sm text-gray-500">
          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
        </p>

        <Link
          to={`/products/${product._id}`}
          className="mt-4 block rounded-lg bg-emerald-500 px-4 py-2.5 text-center font-semibold text-white hover:bg-emerald-600"
        >
          View Product
        </Link>

      </div>

    </div>
  );
}

export default ProductCard;
