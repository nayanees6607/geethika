import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PharmacistDashboard.css';

const InventoryManagement = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMedicine, setNewMedicine] = useState({
        name: '',
        genericName: '',
        manufacturer: '',
        category: 'Medicines & Treatments',
        description: '',
        mrp: '',
        discount: 0,
        price: '',
        stock: '',
        requiresPrescription: false,
        dosageForm: 'tablet',
        strength: ''
    });

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const response = await axios.get('/api/pharmacists/medicines');
            setMedicines(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching medicines:', err);
            setError(err.response?.data?.message || 'Failed to fetch medicines');
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredMedicines = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddMedicine = async (e) => {
        e.preventDefault();
        try {
            const medicineData = {
                ...newMedicine,
                mrp: parseFloat(newMedicine.mrp),
                price: parseFloat(newMedicine.price),
                discount: parseFloat(newMedicine.discount),
                stock: parseInt(newMedicine.stock)
            };

            const response = await axios.post('/api/pharmacists/medicines', medicineData);
            
            if (response.data.medicine) {
                setMedicines([...medicines, response.data.medicine]);
                setNewMedicine({
                    name: '',
                    genericName: '',
                    manufacturer: '',
                    category: 'Medicines & Treatments',
                    description: '',
                    mrp: '',
                    discount: 0,
                    price: '',
                    stock: '',
                    requiresPrescription: false,
                    dosageForm: 'tablet',
                    strength: ''
                });
                setShowAddForm(false);
                alert('Medicine added successfully!');
            }
        } catch (err) {
            console.error('Error adding medicine:', err);
            alert(err.response?.data?.message || 'Failed to add medicine');
        }
    };

    const handleUpdateStock = async (medicineId, newStock) => {
        try {
            const response = await axios.put(`/api/pharmacists/medicines/${medicineId}`, {
                stock: parseInt(newStock)
            });
            
            if (response.data.medicine) {
                setMedicines(medicines.map(med => 
                    med._id === medicineId ? response.data.medicine : med
                ));
                alert('Stock updated successfully!');
            }
        } catch (err) {
            console.error('Error updating stock:', err);
            alert(err.response?.data?.message || 'Failed to update stock');
        }
    };

    if (loading) {
        return <div className="loading">Loading inventory...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="dashboard-content">
            <div className="content-header">
                <h1>Inventory Management</h1>
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Cancel' : '+ Add Medicine'}
                </button>
            </div>

            {showAddForm && (
                <div className="dashboard-card">
                    <h2>Add New Medicine</h2>
                    <form onSubmit={handleAddMedicine}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Medicine Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newMedicine.name}
                                    onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Generic Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newMedicine.genericName}
                                    onChange={(e) => setNewMedicine({...newMedicine, genericName: e.target.value})}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Manufacturer</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newMedicine.manufacturer}
                                    onChange={(e) => setNewMedicine({...newMedicine, manufacturer: e.target.value})}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    className="form-select"
                                    value={newMedicine.category}
                                    onChange={(e) => setNewMedicine({...newMedicine, category: e.target.value})}
                                >
                                    <option value="Medicines & Treatments">Medicines & Treatments</option>
                                    <option value="Basic Needs">Basic Needs</option>
                                    <option value="Health & Nutrition">Health & Nutrition</option>
                                    <option value="Baby Needs">Baby Needs</option>
                                    <option value="Personal Care">Personal Care</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-textarea"
                                    value={newMedicine.description}
                                    onChange={(e) => setNewMedicine({...newMedicine, description: e.target.value})}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>MRP *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={newMedicine.mrp}
                                    onChange={(e) => setNewMedicine({...newMedicine, mrp: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Discount (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    className="form-input"
                                    value={newMedicine.discount}
                                    onChange={(e) => setNewMedicine({...newMedicine, discount: e.target.value})}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Selling Price *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={newMedicine.price}
                                    onChange={(e) => setNewMedicine({...newMedicine, price: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Stock Quantity *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={newMedicine.stock}
                                    onChange={(e) => setNewMedicine({...newMedicine, stock: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Dosage Form</label>
                                <select
                                    className="form-select"
                                    value={newMedicine.dosageForm}
                                    onChange={(e) => setNewMedicine({...newMedicine, dosageForm: e.target.value})}
                                >
                                    <option value="tablet">Tablet</option>
                                    <option value="capsule">Capsule</option>
                                    <option value="syrup">Syrup</option>
                                    <option value="injection">Injection</option>
                                    <option value="cream">Cream/Ointment</option>
                                    <option value="drop">Drop</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Strength</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newMedicine.strength}
                                    onChange={(e) => setNewMedicine({...newMedicine, strength: e.target.value})}
                                    placeholder="e.g., 500mg, 100ml"
                                />
                            </div>
                            
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={newMedicine.requiresPrescription}
                                        onChange={(e) => setNewMedicine({...newMedicine, requiresPrescription: e.target.checked})}
                                    />
                                    Requires Prescription
                                </label>
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">Add Medicine</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="dashboard-card">
                <div className="card-header">
                    <h2>Medicine Inventory ({medicines.length})</h2>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search medicines..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="form-input"
                        />
                    </div>
                </div>
                
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMedicines.length > 0 ? (
                                filteredMedicines.map((medicine) => (
                                    <tr key={medicine._id}>
                                        <td>
                                            <div className="medicine-info">
                                                <strong>{medicine.name}</strong>
                                                {medicine.genericName && (
                                                    <small className="generic-name">({medicine.genericName})</small>
                                                )}
                                                {medicine.manufacturer && (
                                                    <small className="manufacturer">{medicine.manufacturer}</small>
                                                )}
                                            </div>
                                        </td>
                                        <td>{medicine.category}</td>
                                        <td>
                                            ₹{medicine.price} 
                                            {medicine.mrp > medicine.price && (
                                                <small className="discount-badge">
                                                    {Math.round(((medicine.mrp - medicine.price) / medicine.mrp) * 100)}% off
                                                </small>
                                            )}
                                        </td>
                                        <td>
                                            <div className="stock-info">
                                                <span className={`stock-count ${medicine.stock === 0 ? 'out-of-stock' : medicine.stock < 10 ? 'low-stock' : ''}`}>
                                                    {medicine.stock}
                                                </span>
                                                <button 
                                                    className="btn btn-small"
                                                    onClick={() => {
                                                        const newStock = prompt('Enter new stock quantity:', medicine.stock);
                                                        if (newStock !== null && !isNaN(newStock)) {
                                                            handleUpdateStock(medicine._id, newStock);
                                                        }
                                                    }}
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${medicine.stock === 0 ? 'status-danger' : medicine.stock < 10 ? 'status-warning' : 'status-success'}`}>
                                                {medicine.stock === 0 ? 'Out of Stock' : medicine.stock < 10 ? 'Low Stock' : 'In Stock'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-secondary btn-small">Edit</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="no-data">
                                        {searchTerm ? 'No medicines found matching your search.' : 'No medicines in inventory.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryManagement;