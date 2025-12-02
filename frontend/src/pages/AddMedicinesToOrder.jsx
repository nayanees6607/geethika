import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './PharmacistDashboard.css';

const AddMedicinesToOrder = ({ orderId: propOrderId, setActiveTab }) => {
    // Use orderId from props or from URL params
    const params = useParams();
    const orderId = propOrderId || params.orderId;
    
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMedicines, setSelectedMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [approving, setApproving] = useState(false);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            // We don't have a specific endpoint for order details for pharmacists
            // In a real app, you might want to create one
            setLoading(false);
        } catch (err) {
            console.error('Error fetching order:', err);
            setError(err.response?.data?.message || 'Failed to fetch order details');
            setLoading(false);
        }
    };

    const searchMedicines = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await axios.get(`/api/prescription-orders/medicines/search?query=${encodeURIComponent(query)}`);
            setSearchResults(response.data);
        } catch (err) {
            console.error('Error searching medicines:', err);
            setError(err.response?.data?.message || 'Failed to search medicines');
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        searchMedicines(value);
    };

    const addMedicineToOrder = (medicine) => {
        // Check if medicine is already added
        const existing = selectedMedicines.find(item => item.medicineId === medicine._id);
        if (existing) {
            alert('This medicine is already added to the order');
            return;
        }

        setSelectedMedicines([
            ...selectedMedicines,
            {
                medicineId: medicine._id,
                name: medicine.name,
                quantity: 1,
                price: medicine.price
            }
        ]);

        // Clear search
        setSearchTerm('');
        setSearchResults([]);
    };

    const updateMedicineQuantity = (index, quantity) => {
        if (quantity < 1) return;

        const updated = [...selectedMedicines];
        updated[index].quantity = quantity;
        setSelectedMedicines(updated);
    };

    const updateMedicinePrice = (index, price) => {
        if (price < 0) return;

        const updated = [...selectedMedicines];
        updated[index].price = price;
        setSelectedMedicines(updated);
    };

    const removeMedicine = (index) => {
        const updated = [...selectedMedicines];
        updated.splice(index, 1);
        setSelectedMedicines(updated);
    };

    const calculateTotal = () => {
        return selectedMedicines.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleApprove = async () => {
        if (selectedMedicines.length === 0) {
            alert('Please add at least one medicine to the order');
            return;
        }

        if (!window.confirm('Are you sure you want to approve this prescription with the selected medicines?')) {
            return;
        }

        setApproving(true);

        try {
            const response = await axios.patch(`/api/prescription-orders/${orderId}/approve`, {
                medicines: selectedMedicines
            });
            
            if (response.data.order) {
                alert('Prescription approved successfully!');
                // Navigate back to prescription review
                if (setActiveTab) {
                    setActiveTab('prescription-review');
                } else {
                    navigate('/pharmacist/prescription-review');
                }
            }
        } catch (err) {
            console.error('Error approving prescription:', err);
            alert(err.response?.data?.message || 'Failed to approve prescription');
        } finally {
            setApproving(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading order details...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="dashboard-content">
            <div className="dashboard-header">
                <h2>Add Medicines to Order</h2>
                <p>Order ID: {orderId}</p>
            </div>
            
            <div className="add-medicines-content">
                {/* Medicine Search Section */}
                <div className="search-section">
                    <h3>Search Medicines</h3>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search medicines..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="form-input"
                        />
                    </div>
                    
                    {searchResults.length > 0 && (
                        <div className="search-results">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Medicine</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {searchResults.map(medicine => (
                                        <tr key={medicine._id}>
                                            <td>{medicine.name}</td>
                                            <td><span className="badge">{medicine.category}</span></td>
                                            <td>₹{medicine.price.toFixed(2)}</td>
                                            <td>{medicine.stock}</td>
                                            <td>
                                                <button 
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => addMedicineToOrder(medicine)}
                                                >
                                                    Add
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                
                {/* Selected Medicines Section */}
                <div className="selected-medicines">
                    <h3>Selected Medicines</h3>
                    
                    {selectedMedicines.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🛒</div>
                            <p>No medicines added yet</p>
                        </div>
                    ) : (
                        <>
                            <div className="medicines-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Medicine</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedMedicines.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.name}</td>
                                                <td>
                                                    <div className="quantity-control">
                                                        <button 
                                                            onClick={() => updateMedicineQuantity(index, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            -
                                                        </button>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateMedicineQuantity(index, parseInt(e.target.value) || 1)}
                                                            min="1"
                                                            className="quantity-input"
                                                        />
                                                        <button 
                                                            onClick={() => updateMedicineQuantity(index, item.quantity + 1)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => updateMedicinePrice(index, parseFloat(e.target.value) || 0)}
                                                        min="0"
                                                        step="0.01"
                                                        className="price-input"
                                                    />
                                                </td>
                                                <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                                                <td>
                                                    <button 
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => removeMedicine(index)}
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="order-summary">
                                <div className="summary-row total">
                                    <span>Total Amount:</span>
                                    <span>₹{calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div className="actions">
                                <button 
                                    className="btn btn-primary btn-block"
                                    onClick={handleApprove}
                                    disabled={approving}
                                >
                                    {approving ? 'Approving...' : 'Approve Prescription'}
                                </button>
                                
                                <button 
                                    className="btn btn-secondary btn-block"
                                    onClick={() => {
                                        if (setActiveTab) {
                                            setActiveTab('prescription-review');
                                        } else {
                                            navigate('/pharmacist/prescription-review');
                                        }
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddMedicinesToOrder;