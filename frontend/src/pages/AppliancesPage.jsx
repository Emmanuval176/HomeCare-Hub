import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Cpu, ArrowRight, Trash2, Edit, MoreVertical } from 'lucide-react';
import { applianceService } from '../services/api';
import AuthRequiredState from '../components/AuthRequiredState';

export default function AppliancesPage({ onSelectAppliance, openAddApplianceModal, onEditAppliance, currentUser, openAuthModal, setActivePage }) {
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const fetchAppliances = async () => {
    setLoading(true);
    try {
      const data = await applianceService.getAll();
      setAppliances(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAppliances();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <AuthRequiredState
        title="Sign in to View Appliances"
        pageName="your Appliances"
        openAuthModal={openAuthModal}
        setActivePage={setActivePage}
      />
    );
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this appliance?')) {
      try {
        await applianceService.delete(id);
        fetchAppliances();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filter & Sort logic
  const filteredAppliances = appliances.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
                          app.brand.toLowerCase().includes(search.toLowerCase()) ||
                          app.model_number.toLowerCase().includes(search.toLowerCase()) ||
                          app.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || app.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'price') return (b.purchase_price || 0) - (a.purchase_price || 0);
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-white text-gray-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-black">Appliances</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and organize all your home appliances.</p>
        </div>

        <button
          onClick={openAddApplianceModal}
          className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-6 py-3 rounded-full transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Appliance
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search appliance name, brand, model..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white text-gray-700 font-medium"
          >
            <option value="All">All Categories</option>
            <option value="Refrigerator">Refrigerator</option>
            <option value="Air Conditioner">Air Conditioner</option>
            <option value="Washing Machine">Washing Machine</option>
            <option value="Television">Television</option>
            <option value="Microwave">Microwave</option>
            <option value="Water Heater">Water Heater</option>
            <option value="Laptop">Laptop</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white text-gray-700 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Service Due">Service Due</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Out of Order">Out of Order</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white text-gray-700 font-medium"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="price">Sort: Price (High-Low)</option>
          </select>
        </div>
      </div>

      {/* Appliance Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-gray-400">Loading appliances...</div>
      ) : filteredAppliances.length === 0 ? (
        <div className="py-20 text-center bg-gray-50 rounded-3xl border border-gray-100">
          <Cpu className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p className="font-bold text-gray-700">No appliances found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAppliances.map(app => (
            <div
              key={app.id}
              onClick={() => onSelectAppliance(app.id)}
              className="group bg-white rounded-3xl border border-gray-200/90 overflow-hidden hover-lift cursor-pointer p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-50 border border-gray-100">
                  <img
                    src={app.image_url || 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80'}
                    alt={app.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-xs ${
                      app.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditAppliance(app); }}
                      className="p-1.5 bg-white/90 rounded-full text-gray-700 hover:text-black shadow-sm"
                      title="Edit Appliance"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(app.id, e)}
                      className="p-1.5 bg-white/90 rounded-full text-red-600 hover:text-red-700 shadow-sm"
                      title="Delete Appliance"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{app.category}</p>
                <h3 className="text-lg font-bold text-black tracking-tight mt-0.5">{app.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Location: {app.location}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
                <span>Model: {app.model_number || 'N/A'}</span>
                <div className="w-8 h-8 rounded-full border border-gray-200 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
