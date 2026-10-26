import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, Package } from 'lucide-react';
import { formatPrice } from '../lib/format';

export default function OrderSuccess() {
  const { id } = useParams();
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50">
        <CheckCircle2 size={34} className="text-brand-600" />
      </span>

      <h1 className="mt-5 font-display text-2xl font-bold">Order confirmed</h1>
      <p className="mt-2 text-sm text-muted">
        Thanks — your mock order went through. No payment was taken.
      </p>

      <div className="card mt-6 p-5 text-left">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">Order ID</span>
          <span className="font-mono text-sm text-body">#{(order?._id || id).slice(-8).toUpperCase()}</span>
        </div>

        {order && (
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Items" value={`${order.items.length}`} />
            <Row label="Subtotal" value={formatPrice(order.itemsPrice)} />
            <Row
              label="Shipping"
              value={order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)}
            />
            <Row label="Sales tax" value={formatPrice(order.taxPrice)} />
            <div className="flex justify-between border-t border-line pt-2.5 font-bold text-heading">
              <dt>Total paid</dt>
              <dd>{formatPrice(order.totalPrice)}</dd>
            </div>
          </dl>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/orders" className="btn-ghost">
          <Package size={16} /> View my orders
        </Link>
        <Link to="/" className="btn-primary">
          Keep shopping
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="text-body">{value}</dd>
    </div>
  );
}
