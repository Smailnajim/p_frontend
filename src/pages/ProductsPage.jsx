import { useState, useEffect } from 'react';

function ProductsPage({ showToast, apiUrl }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        type: 'product',
    });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/products`);
            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            showToast('Failed to fetch products', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            type: 'product',
        });
        setEditingProduct(null);
    };

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price.toString(),
                category: product.category || '',
                type: product.type || 'product',
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.price) {
            showToast('Name and price are required', 'error');
            return;
        }

        try {
            setLoading(true);
            const url = editingProduct
                ? `${apiUrl}/products/${editingProduct.id}`
                : `${apiUrl}/products`;

            const response = await fetch(url, {
                method: editingProduct ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                }),
            });

            const data = await response.json();

            if (data.success) {
                showToast(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
                fetchProducts();
                closeModal();
            } else {
                showToast(data.message || 'Failed to save product', 'error');
            }
        } catch (error) {
            showToast('Failed to save product', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/products/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (data.success) {
                showToast('Product deleted successfully!');
                setProducts(products.filter(p => p.id !== id));
            } else {
                showToast(data.message || 'Failed to delete product', 'error');
            }
        } catch (error) {
            showToast('Failed to delete product', 'error');
        }
    };

    const productCount = products.filter(p => p.type === 'product').length;
    const serviceCount = products.filter(p => p.type === 'service').length;

    return (
        <div className="animate-fadeIn">
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header__title">
                    <div className="page-header__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <div>
                        <h2>Products & Services</h2>
                        <p>Manage your products and services catalog</p>
                    </div>
                </div>
                <button className="btn btn--primary" onClick={() => openModal()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product/Service
                </button>
            </div>



            {/* Products Table */}
            <div className="card">
                <div className="card__header">
                    <h3 className="card__title">All Products & Services</h3>
                </div>
                <div className="card__body" style={{ padding: 0 }}>
                    {loading && products.length === 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                            <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="empty-state__title">No Products Yet</h3>
                            <p className="empty-state__text">Add your first product or service to get started!</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <strong>{product.name}</strong>
                                            {product.description && (
                                                <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', margin: '0.25rem 0 0' }}>
                                                    {product.description}
                                                </p>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`type-badge type-badge--${product.type}`}>
                                                {product.type}
                                            </span>
                                        </td>
                                        <td>{product.category || '-'}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
                                            ${product.price.toFixed(2)}
                                        </td>
                                        <td>
                                            <div className="data-table__actions">
                                                <button
                                                    className="btn btn--secondary btn--sm"
                                                    onClick={() => openModal(product)}
                                                    title="Edit"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="btn btn--danger btn--sm"
                                                    onClick={() => handleDelete(product.id)}
                                                    title="Delete"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h3 className="modal__title">
                                {editingProduct ? 'Edit Product/Service' : 'Add New Product/Service'}
                            </h3>
                            <button className="modal__close" onClick={closeModal}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal__body">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="name">Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="form-input"
                                        placeholder="Enter product/service name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="type">Type</label>
                                    <select
                                        id="type"
                                        name="type"
                                        className="form-input"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                    >
                                        <option value="product">Product</option>
                                        <option value="service">Service</option>
                                    </select>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="price">Price ($) *</label>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            className="form-input"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="category">Category</label>
                                        <input
                                            type="text"
                                            id="category"
                                            name="category"
                                            className="form-input"
                                            placeholder="e.g., Electronics, Consulting"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        className="form-textarea"
                                        placeholder="Enter product/service description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        style={{ minHeight: '80px' }}
                                    />
                                </div>
                            </div>
                            <div className="modal__footer">
                                <button type="button" className="btn btn--secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn--primary" disabled={loading}>
                                    {loading ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductsPage;
