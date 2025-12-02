import React, { useState, useEffect } from 'react';
import { 
  FaUtensils, 
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
  FaSpinner,
  FaImage,
  FaTag,
  FaPercent,
  FaRobot
} from 'react-icons/fa';
import { API_BASE } from '../../api';

const CATEGORY_OPTIONS = [
  'Pasta', 'Pizza', 'Main', 'Salad', 'Dessert', 'Burger', 'Drinks', 'Sides'
];

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Pasta',
    is_available: true,
    has_discount: false,
    discount_percentage: 0,
    calories: '',
    protein: '',
    carbs: '',
    fiber: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecs, setAiRecs] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token || !user?.id) throw new Error('Missing auth');

      const response = await fetch(`${API_BASE}/vendor/menu/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.menu_items || []);
      } else {
        console.warn('API failed');
        throw new Error('Failed to load menu');
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        is_available: item.is_available,
        has_discount: item.has_discount || false,
        discount_percentage: item.discount_percentage || 0,
        calories: item.calories ?? '',
        protein: item.protein ?? '',
        carbs: item.carbs ?? '',
        fiber: item.fiber ?? ''
      });
      setImageFile(null);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Pasta',
        is_available: true,
        has_discount: false,
        discount_percentage: 0,
        calories: '',
        protein: '',
        carbs: '',
        fiber: ''
      });
      setImageFile(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Pasta',
      is_available: true,
      has_discount: false,
      discount_percentage: 0,
      calories: '',
      protein: '',
      carbs: '',
      fiber: ''
    });
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token || !user?.id) throw new Error('Missing auth');

      // API call for real data
      const url = editingItem
        ? `${API_BASE}/vendor/menu/${editingItem.id}`
        : `${API_BASE}/vendor/menu/${user.id}`;
      
      const method = editingItem ? 'PUT' : 'POST';

      let response;
      // Build FormData for multipart upload
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('price', String(parseFloat(formData.price)));
      fd.append('category', formData.category);
      fd.append('is_available', String(!!formData.is_available));
      fd.append('has_discount', String(!!formData.has_discount));
      fd.append('discount_percentage', String(parseInt(formData.discount_percentage || 0)));
      if (formData.calories !== '') fd.append('calories', String(parseFloat(formData.calories)));
      if (formData.protein !== '') fd.append('protein', String(parseFloat(formData.protein)));
      if (formData.carbs !== '') fd.append('carbs', String(parseFloat(formData.carbs)));
      if (formData.fiber !== '') fd.append('fiber', String(parseFloat(formData.fiber)));
      if (imageFile) {
        fd.append('image', imageFile);
      }

      response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
          // NOTE: do not set Content-Type for FormData; browser will set boundary
        },
        body: fd
      });

      if (response.ok) {
        await fetchMenuItems();
        handleCloseModal();
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      console.error('Error saving menu item:', err);
      // Keep dialog open to show error or let user retry
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token || !user?.id) throw new Error('Missing auth');

      const response = await fetch(`${API_BASE}/vendor/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
      } else {
        throw new Error('Failed to delete');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      // Keep current list; user can retry
    }
  };

  const toggleAvailability = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const newAvailability = !item.is_available;
      if (!token || !user?.id) throw new Error('Missing auth');

      const response = await fetch(`${API_BASE}/vendor/menu/${item.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_available: newAvailability })
      });

      if (response.ok) {
        setMenuItems(prevItems =>
          prevItems.map(i =>
            i.id === item.id ? { ...i, is_available: newAvailability } : i
          )
        );
      } else {
        throw new Error('Failed to update availability');
      }
    } catch (err) {
      console.error('Error toggling availability:', err);
      // no local mutation
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="text-4xl text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <FaPlus /> Add New Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <FaRobot className="text-green-600" />
            <p className="text-sm text-gray-700 font-medium">AI recommendations based on student meal preferences</p>
          </div>
          <button
            onClick={async () => {
              try {
                setAiOpen(true); setAiLoading(true);
                const token = localStorage.getItem('token');
                if (!token || !user?.id) throw new Error('Missing auth');
                const res = await fetch(`${API_BASE}/vendor/ai/recommendations/${user.id}?limit=5`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                const data = res.ok ? await res.json() : { recommendations: [] };
                setAiRecs(data.recommendations || []);
              } catch (e) {
                setAiRecs([]);
              } finally {
                setAiLoading(false);
              }
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
          >
            {aiLoading ? 'Generating...' : 'Generate AI Suggestions'}
          </button>
        </div>
        {aiOpen && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiLoading ? (
              <div className="col-span-full flex items-center justify-center py-8"><FaSpinner className="animate-spin text-green-600" /></div>
            ) : aiRecs.length === 0 ? (
              <div className="col-span-full text-center text-gray-600 py-6">No suggestions right now</div>
            ) : (
              aiRecs.map((r, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{r.name}</h3>
                    <span className="text-sm text-emerald-700 font-semibold">₱{Number(r.price).toFixed(0)}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{r.description}</p>
                  <div className="text-xs text-gray-700 flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 bg-gray-100 rounded">{r.category}</span>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded">{r.calories} kcal</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">P {r.protein}g</span>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">C {r.carbs}g</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">F {r.fiber}g</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleOpenModal({
                        name: r.name,
                        description: r.description,
                        price: r.price,
                        category: r.category,
                        is_available: true,
                        has_discount: false,
                        discount_percentage: 0,
                        calories: r.calories,
                        protein: r.protein,
                        carbs: r.carbs,
                        fiber: r.fiber
                      })}
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Edit Before Adding
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          if (!token || !user?.id) throw new Error('Missing auth');
                          const res = await fetch(`${API_BASE}/vendor/menu/${user.id}`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              name: r.name,
                              description: r.description,
                              price: r.price,
                              category: r.category,
                              is_available: true,
                              has_discount: false,
                              discount_percentage: 0,
                              calories: r.calories,
                              protein: r.protein,
                              carbs: r.carbs,
                              fiber: r.fiber
                            })
                          });
                          if (res.ok) {
                            await fetchMenuItems();
                          }
                        } catch (_) {}
                      }}
                      className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      Add to Menu
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {CATEGORY_OPTIONS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaUtensils className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No menu items found</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {item.image_url ? (
                  <img
                    src={item.image_url.startsWith('/') ? `${API_BASE.replace('/api','')}${item.image_url}` : item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaImage className="text-6xl text-gray-400" />
                  </div>
                )}
                {item.has_discount && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1 shadow-lg">
                    <FaTag className="text-xs" />
                    {item.discount_percentage}% OFF
                  </div>
                )}
                {!item.is_available && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Unavailable</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full mt-1">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-right">
                  {item.has_discount ? (
                    <>
                      <p className="text-sm text-gray-400 line-through">₱{item.price.toFixed(2)}</p>
                      <p className="text-xl font-bold text-red-600">
                        ₱{(item.price * (1 - item.discount_percentage / 100)).toFixed(2)}
                      </p>
                    </>
                  ) : (
                    <p className="text-xl font-bold text-green-600">₱{item.price.toFixed(2)}</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
              <div className="text-xs text-gray-700 flex flex-wrap gap-2 mb-3">
                {typeof item.calories !== 'undefined' && item.calories !== null && (
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded">{Number(item.calories).toFixed(0)} kcal</span>
                )}
                {typeof item.protein !== 'undefined' && item.protein !== null && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">P {Number(item.protein).toFixed(0)}g</span>
                )}
                {typeof item.carbs !== 'undefined' && item.carbs !== null && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">C {Number(item.carbs).toFixed(0)}g</span>
                )}
                {typeof item.fiber !== 'undefined' && item.fiber !== null && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">F {Number(item.fiber).toFixed(0)}g</span>
                )}
              </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAvailability(item)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                      item.is_available
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {item.is_available ? <FaToggleOn /> : <FaToggleOff />}
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </button>
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Pasta Carbonara"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe your dish..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₱) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nutrition</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Calories (kcal)"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.protein}
                      onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Protein (g)"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.carbs}
                      onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Carbs (g)"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.fiber}
                      onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Fiber (g)"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {editingItem?.image_url && !imageFile && (
                  <p className="text-xs text-gray-500 mt-1">Current: {editingItem.image_url}</p>
                )}
                {imageFile && (
                  <p className="text-xs text-gray-500 mt-1">Selected: {imageFile.name}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="is_available" className="text-sm font-medium text-gray-700">
                    Available for orders
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="has_discount"
                    checked={formData.has_discount}
                    onChange={(e) => setFormData({ ...formData, has_discount: e.target.checked })}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="has_discount" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <FaTag className="text-red-500" />
                    Has promotional discount
                  </label>
                </div>

                {formData.has_discount && (
                  <div className="ml-6 bg-red-50 border border-red-200 rounded-lg p-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <FaPercent className="text-red-500" />
                      Discount Percentage
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={formData.discount_percentage}
                        onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
                        className="flex-1 px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="e.g., 20"
                      />
                      <span className="text-gray-700 font-medium">%</span>
                    </div>
                    {formData.price && formData.discount_percentage > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        Discounted price: <span className="font-bold text-red-600">
                          ₱{(parseFloat(formData.price) * (1 - formData.discount_percentage / 100)).toFixed(2)}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
