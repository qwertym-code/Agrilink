import { useAuth } from '../context/AuthContext';

export default function ConsumerDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="h3 text-agrilink">Hello, {user.name}</h1>
      <p className="text-muted">Browse fresh produce from farmers near you.</p>

      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h2 className="h5">Your account</h2>
          <dl className="row mb-0 small">
            <dt className="col-sm-3">Email</dt>
            <dd className="col-sm-9">{user.email}</dd>
            <dt className="col-sm-3">Phone</dt>
            <dd className="col-sm-9">+91 {user.phone}</dd>
            <dt className="col-sm-3">Account type</dt>
            <dd className="col-sm-9 text-capitalize">{user.role}</dd>
          </dl>
        </div>
      </div>

      <div className="alert alert-light border mt-4 mb-0">
        Produce listings, cart, and orders land here next.
      </div>
    </div>
  );
}
