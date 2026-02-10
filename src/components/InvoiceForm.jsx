import { useState, useEffect } from 'react';

const defaultItem = { description: '', quantity: 1, unitPrice: 0 };

function InvoiceForm({ onSubmit, loading, clients = [], products = [] }) {
    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        clientAddress: '',
        items: [{ ...defaultItem }],
        taxRate: 0,
        notes: '',
        dueDate: '',
    });

    const [selectedClientId, setSelectedClientId] = useState('');

    const handleClientSelect = (e) => {
        const clientId = e.target.value;
        setSelectedClientId(clientId);

        if (clientId) {
            const client = clients.find(c => c.id === clientId);
            if (client) {
                setFormData({
                    ...formData,
                    clientName: client.name,
                    clientEmail: client.email || '',
                    clientAddress: client.address || '',
                });
            }
        } else {
            setFormData({
                ...formData,
                clientName: '',
                clientEmail: '',
                clientAddress: '',
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index] = {
            ...newItems[index],
            [field]: field === 'description' ? value : parseFloat(value) || 0
        };
        setFormData({ ...formData, items: newItems });
    };

    const handleProductSelect = (index, productId) => {
        if (!productId) return;

        const product = products.find(p => p.id === productId);
        if (product) {
            const newItems = [...formData.items];
            newItems[index] = {
                ...newItems[index],
                description: product.name,
                unitPrice: product.price,
            };
            setFormData({ ...formData, items: newItems });
        }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { ...defaultItem }]
        });
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const calculateSubtotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const calculateTax = () => {
        return calculateSubtotal() * (formData.taxRate / 100);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.clientName.trim()) {
            alert('Client name is required');
            return;
        }

        if (formData.items.some(item => !item.description.trim())) {
            alert('All items must have a description');
            return;
        }

        const success = await onSubmit(formData);

        if (success) {
            setFormData({
                clientName: '',
                clientEmail: '',
                clientAddress: '',
                items: [{ ...defaultItem }],
                taxRate: 0,
                notes: '',
                dueDate: '',
            });
            setSelectedClientId('');
        }
    };

    return (
        <div className="card animate-fadeIn">
            <div className="card__header">
                <h3 className="card__title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--primary-500)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create New Invoice
                </h3>
            </div>

            <form className="card__body" onSubmit={handleSubmit}>
                {/* Client Selection */}
                <h4 style={{ marginBottom: '1rem', color: 'var(--gray-700)' }}>Client Information</h4>

                {clients.length > 0 && (
                    <div className="form-group">
                        <label className="form-label" htmlFor="clientSelect">Select Existing Client</label>
                        <select
                            id="clientSelect"
                            className="form-input"
                            value={selectedClientId}
                            onChange={handleClientSelect}
                        >
                            <option value="">-- Select a client or enter manually --</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.name} {client.company ? `(${client.company})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label" htmlFor="clientName">Client Name *</label>
                        <input
                            type="text"
                            id="clientName"
                            name="clientName"
                            className="form-input"
                            placeholder="Enter client name"
                            value={formData.clientName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="clientEmail">Email</label>
                        <input
                            type="email"
                            id="clientEmail"
                            name="clientEmail"
                            className="form-input"
                            placeholder="client@example.com"
                            value={formData.clientEmail}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label" htmlFor="clientAddress">Address</label>
                        <input
                            type="text"
                            id="clientAddress"
                            name="clientAddress"
                            className="form-input"
                            placeholder="Enter client address"
                            value={formData.clientAddress}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="dueDate">Due Date</label>
                        <input
                            type="date"
                            id="dueDate"
                            name="dueDate"
                            className="form-input"
                            value={formData.dueDate}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                {/* Invoice Items */}
                <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--gray-700)' }}>
                    Invoice Items
                </h4>

                <table className="items-table">
                    <thead>
                        <tr>
                            <th style={{ width: '35%' }}>Description</th>
                            {products.length > 0 && <th style={{ width: '20%' }}>Quick Add</th>}
                            <th style={{ width: '12%' }}>Qty</th>
                            <th style={{ width: '15%' }}>Unit Price (DH)</th>
                            <th style={{ width: '12%' }}>Total</th>
                            <th style={{ width: '6%' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.items.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Item description"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                        required
                                    />
                                </td>
                                {products.length > 0 && (
                                    <td>
                                        <select
                                            className="form-input"
                                            onChange={(e) => handleProductSelect(index, e.target.value)}
                                            defaultValue=""
                                        >
                                            <option value="">Select...</option>
                                            {products.map(product => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name} ({product.price} DH)
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                )}
                                <td>
                                    <input
                                        type="number"
                                        className="form-input"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-input"
                                        min="0"
                                        step="0.01"
                                        value={item.unitPrice}
                                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                        required
                                    />
                                </td>
                                <td className="total-cell">
                                    {(item.quantity * item.unitPrice).toFixed(2)} DH
                                </td>
                                <td>
                                    {formData.items.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--sm"
                                            onClick={() => removeItem(index)}
                                            style={{ color: 'var(--danger-500)' }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={addItem}
                    style={{ marginTop: '1rem' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Item
                </button>

                {/* Tax and Summary */}
                <div className="invoice-summary">
                    <div className="summary-row">
                        <span className="summary-row__label">Subtotal:</span>
                        <span className="summary-row__value">{calculateSubtotal().toFixed(2)} DH</span>
                    </div>

                    <div className="summary-row" style={{ alignItems: 'center' }}>
                        <span className="summary-row__label">Tax Rate (%):</span>
                        <input
                            type="number"
                            name="taxRate"
                            className="form-input"
                            style={{ width: '100px', textAlign: 'right' }}
                            min="0"
                            max="100"
                            value={formData.taxRate}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="summary-row">
                        <span className="summary-row__label">Tax Amount:</span>
                        <span className="summary-row__value">{calculateTax().toFixed(2)} DH</span>
                    </div>

                    <div className="summary-row summary-row--total">
                        <span className="summary-row__label">Total:</span>
                        <span className="summary-row__value">{calculateTotal().toFixed(2)} DH</span>
                    </div>
                </div>

                {/* Notes */}
                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label" htmlFor="notes">Notes</label>
                    <textarea
                        id="notes"
                        name="notes"
                        className="form-textarea"
                        placeholder="Add any additional notes..."
                        value={formData.notes}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn btn--primary btn--lg btn--full"
                    disabled={loading}
                    style={{ marginTop: '1.5rem' }}
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Creating...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Create Invoice
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

export default InvoiceForm;
