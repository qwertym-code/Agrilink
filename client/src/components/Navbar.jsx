import { Link, useNavigate } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-agrilink shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          Agrilink
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to={dashboardPath(user.role)}>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <span className="navbar-text text-white-50 small">
                    {user.name} · {user.role}
                  </span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-light btn-sm" onClick={handleLogout}>
                    Log out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Log in
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-light btn-sm" to="/register">
                    Sign up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
