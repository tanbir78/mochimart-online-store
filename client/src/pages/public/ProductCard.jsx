
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
    <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Product Image */}
      <div className="flex h-52 items-center justify-center overflow-hidden bg-secondary">

        {image && !imageError ? (
          <img
            src={image}
            alt={
              product.images?.find((img) => img.isPrimary)?.alt ||
              product.name
            }
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

        <p className="text-sm font-medium text-primary">
          {product.category}
        </p>

        <h3 className="mt-2 text-lg font-semibold text-base-content">
          {product.name}
        </h3>

        <p className="mt-3 text-xl font-bold text-primary">
          ৳{Number(product.price).toLocaleString('en-BD')}
        </p>

        <p className={`mt-2 text-sm font-medium ${
          product.stock > 0
            ? 'text-success'
            : 'text-error'
        }`}>
          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
        </p>

        <Link
          to={`/products/${product._id}`}
          className="mt-4 block rounded-xl bg-primary px-4 py-2.5 text-center font-semibold text-primary-content transition duration-200 hover:brightness-95 hover:-translate-y-0.5"
        >
          View Product →
        </Link>

      </div>

    </div>
  );
}

export default ProductCard;
