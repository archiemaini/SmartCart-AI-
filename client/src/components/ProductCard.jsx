import { Link } from 'react-router-dom';
import { Check, ShoppingCart, Trash2, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, discountPercent, handleImageError } from '../lib/format';


export default function ProductCard({ product, onDelete }) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(product._id);
  const off = discountPercent(product.price, product.mrp);
  const outOfStock = product.countInStock === 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-emerald-300">
      
      <Link to={`/product/${product._id}`} className="relative block aspect-square overflow-hidden bg-neutral-50/80 p-4">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          onError={handleImageError}
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
        />

        {off > 0 && (
          <span className="absolute left-3 top-3 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs">
            {off}% off
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-3 top-3 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 shadow-xs">
            Out of stock
          </span>
        )}
      </Link>

      
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              {product.brand || product.category}
            </span>
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(product._id);
                }}
                title="Delete product (CRUD Delete demo)"
                className="text-neutral-300 hover:text-red-600 transition p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          <Link to={`/product/${product._id}`}>
            <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 group-hover:text-emerald-700 transition">
              {product.title}
            </h3>
          </Link>

          
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < Math.floor(product.rating || 4) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}
                />
              ))}
            </div>
            <span className="font-semibold text-neutral-800 text-[11px]">{product.rating || 4.2}</span>
            <span className="text-neutral-400 text-[11px]">({(product.numReviews || 350).toLocaleString('en-IN')})</span>
          </div>
        </div>

        
        <div className="flex items-end justify-between gap-2 pt-2 border-t border-neutral-100">
          <div>
            <p className="text-base font-extrabold text-neutral-900">{formatPrice(product.price)}</p>
            {off > 0 && <p className="text-[11px] text-neutral-400 line-through">{formatPrice(product.mrp)}</p>}
          </div>

          <button
            type="button"
            onClick={() => addItem(product)}
            disabled={outOfStock}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              inCart
                ? 'border border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs'
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {inCart ? <Check size={14} /> : <ShoppingCart size={14} />}
            <span>{inCart ? 'Added' : 'Add'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
