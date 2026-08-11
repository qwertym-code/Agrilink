import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage, getFieldErrors } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useShopConfig } from '../context/ShopConfigContext';
import TopBar from '../components/TopBar';
import { formatPrice, titleCase } from '../utils/format';
import { PlusIcon, TrashIcon, EditIcon } from '../components/Icons';
import ProductImage from '../components/ProductImage';

const BLANK = {
  name: '', description: '', price: '', unit: '', category: 'vegetables',
  imageUrl: '', tags: [], stock: '',
};

export default function RetailerDashboard() {
  const { user } = useAuth();
  const { categories, tags: allTags } = useShopConfig();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/products/mine')
      .then(({ data }) => { setProducts(data.items); setListError(''); })
      .catch((err) => setListError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(BLANK);
    setFormError('');
    setFieldErrors({});
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      unit: product.unit || '',
      category: product.category,
      imageUrl: product.imageUrl || '',
      tags: product.tags || [],
      stock: String(product.stock),
    });
    setFormError('');
    setFieldErrors({});
    setShowForm(true);
  };

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleTag = (tag) =>
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));

  const save = async (e) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});
    setSaving(true);

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
    };

    try {
      if (editingId) await api.patch(`/products/${editingId}`, payload);
      else await api.post('/products', payload);
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product) => {
    // Removing a listing is easy to do by accident on a phone.
    if (!window.confirm(`Remove "${product.name}" from your listings?`)) return;
    try {
      await api.delete(`/products/${product._id}`);
      load();
    } catch (err) {
      setListError(getErrorMessage(err));
    }
  };

  return (
    <>
      <TopBar title="My listings" />

      <div className="ag-shell px-3 pt-3">
        <div className="ag-panel mb-3">
          <div className="fw-bold" style={{ fontSize: '1.05rem' }}>{user.farmName}</div>
          <div className="ag-muted" style={{ fontSize: '0.82rem' }}>{user.location}</div>
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-agrilink btn-sm d-flex align-items-center gap-1" onClick={openCreate}>
              <PlusIcon size={16} /> Add produce
            </button>
            <Link to="/retailer/orders" className="btn btn-agrilink-outline btn-sm">Incoming orders</Link>
          </div>
        </div>

        {listError && <div className="alert alert-danger py-2">{listError}</div>}

        {showForm && (
          <form onSubmit={save} className="ag-panel mb-3">
            <h2 className="ag-section-title">{editingId ? 'Edit listing' : 'New listing'}</h2>

            {formError && <div className="alert alert-danger py-2" style={{ fontSize: '0.85rem' }}>{formError}</div>}

            <Input id="name" label="Produce name" value={form.name} onChange={update('name')} error={fieldErrors.name} required />
            <Input id="unit" label="Unit" placeholder="250g / Bunch, per head…" value={form.unit} onChange={update('unit')} error={fieldErrors.unit} />

            <div className="row g-2">
              <div className="col-6">
                <Input id="price" label="Price (₹)" type="number" min="0" step="0.01" value={form.price} onChange={update('price')} error={fieldErrors.price} required />
              </div>
              <div className="col-6">
                <Input id="stock" label="Stock" type="number" min="0" value={form.stock} onChange={update('stock')} error={fieldErrors.stock} required />
              </div>
            </div>

            <label htmlFor="category" className="form-label small fw-semibold mb-1">Category</label>
            <select id="category" className="ag-input mb-3" value={form.category} onChange={update('category')}>
              {categories.map((c) => <option key={c} value={c}>{titleCase(c)}</option>)}
            </select>

            <Input id="imageUrl" label="Image URL" placeholder="https://…" value={form.imageUrl} onChange={update('imageUrl')} error={fieldErrors.imageUrl} />

            <label className="form-label small fw-semibold mb-1">Labels</label>
            <div className="ag-chips mb-3">
              {allTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={`ag-chip ${form.tags.includes(tag) ? 'active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {titleCase(tag)}
                </button>
              ))}
            </div>

            <label htmlFor="description" className="form-label small fw-semibold mb-1">Description</label>
            <textarea
              id="description"
              className="ag-input mb-3"
              rows={3}
              value={form.description}
              onChange={update('description')}
            />

            <div className="d-flex gap-2">
              <button className="btn btn-agrilink flex-grow-1" type="submit" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add listing'}
              </button>
              <button className="btn btn-agrilink-outline" type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="ag-skeleton" style={{ height: 120 }} />
        ) : products.length === 0 ? (
          <div className="ag-panel text-center">
            <p className="fw-semibold mb-1">No listings yet</p>
            <p className="ag-muted mb-3" style={{ fontSize: '0.85rem' }}>
              Add your first produce and consumers will see it straight away.
            </p>
            <button className="btn btn-agrilink btn-sm" onClick={openCreate}>Add produce</button>
          </div>
        ) : (
          products.map((product) => (
            <div key={product._id} className="ag-panel mb-2 d-flex gap-3 align-items-center">
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                iconSize={20}
                style={{ width: 56, height: 56, flex: '0 0 auto', borderRadius: 10 }}
              />

              <div className="flex-grow-1">
                <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{product.name}</div>
                <div className="ag-muted" style={{ fontSize: '0.76rem' }}>
                  {formatPrice(product.price)} · {product.unit} · {product.stock} in stock
                </div>
              </div>

              <button className="btn btn-sm border-0 p-1 ag-muted" onClick={() => openEdit(product)} aria-label={`Edit ${product.name}`}>
                <EditIcon size={17} />
              </button>
              <button className="btn btn-sm border-0 p-1 text-danger" onClick={() => remove(product)} aria-label={`Remove ${product.name}`}>
                <TrashIcon size={17} />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function Input({ id, label, error, ...props }) {
  return (
    <>
      <label htmlFor={id} className="form-label small fw-semibold mb-1">{label}</label>
      <input id={id} className={`ag-input ${error ? 'is-invalid' : ''}`} {...props} />
      {error
        ? <div className="text-danger mb-3 mt-1" style={{ fontSize: '0.78rem' }}>{error}</div>
        : <div className="mb-3" />}
    </>
  );
}
