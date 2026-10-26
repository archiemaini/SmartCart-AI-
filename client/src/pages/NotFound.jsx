import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-md gap-4 px-4 py-28 text-center">
      <Compass size={44} className="mx-auto text-line-strong" />
      <h1 className="font-display text-3xl font-bold">404</h1>
      <p className="text-sm text-muted">That page does not exist.</p>
      <Link to="/" className="btn-primary mx-auto">
        Back to the store
      </Link>
    </div>
  );
}
