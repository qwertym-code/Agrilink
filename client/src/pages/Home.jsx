import { Link } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="text-center py-5">
      <h1 className="display-5 fw-bold text-agrilink">Agrilink</h1>
      <p className="lead text-muted mb-4">
        Fresh produce, straight from the farmer to your table.
      </p>

      {user ? (
        <Link className="btn btn-agrilink btn-lg" to={dashboardPath(user.role)}>
          Go to your dashboard
        </Link>
      ) : (
        <div className="d-flex gap-2 justify-content-center">
          <Link className="btn btn-agrilink btn-lg" to="/register">
            Create an account
          </Link>
          <Link className="btn btn-outline-secondary btn-lg" to="/login">
            Log in
          </Link>
        </div>
      )}
    </div>
  );
}
