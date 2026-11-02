import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Building2, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  UserPlus,
  Sparkles,
  Search,
  Car,
  Dog,
  Briefcase,
  AlertCircle,
  ShieldCheck,
  Tag,
  Key
} from 'lucide-react';
import { api } from '../../api/client';
import { Unit } from '../../types';
import { Modal } from '../../components/Modal';

export const TenantsManager: React.FC = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'properties' | 'tenants'>('properties');
  const [searchQuery, setSearchQuery] = useState('');

  // New Resident Modal State
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantPassword, setTenantPassword] = useState('Tenant12345!');
  const [tenantUnitId, setTenantUnitId] = useState('');
  const [leaseStart, setLeaseStart] = useState('2026-01-01');
  const [leaseEnd, setLeaseEnd] = useState('2026-12-31');
  const [monthlyRent, setMonthlyRent] = useState(1850);
  const [deposit, setDeposit] = useState(1850);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [employer, setEmployer] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [petInfo, setPetInfo] = useState('');
  const [tenantNotes, setTenantNotes] = useState('');
  const [isSubmittingTenant, setIsSubmittingTenant] = useState(false);

  // New Property / Unit Modal State
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [unitNum, setUnitNum] = useState('');
  const [propertyName, setPropertyName] = useState('Capital View Residences');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [unitAddress, setUnitAddress] = useState('1024 Capital View Blvd, Austin, TX 78704');
  const [floor, setFloor] = useState('Floor 2');
  const [unitBeds, setUnitBeds] = useState(2);
  const [unitBaths, setUnitBaths] = useState(2.0);
  const [unitSqFt, setUnitSqFt] = useState(980);
  const [unitRent, setUnitRent] = useState(1850);
  const [parkingSpot, setParkingSpot] = useState('Bay #14');
  const [unitStatus, setUnitStatus] = useState('Vacant');
  const [amenities, setAmenities] = useState('In-Unit Laundry, Private Balcony, Central HVAC, Dishwasher');
  const [unitNotes, setUnitNotes] = useState('');
  const [isSubmittingUnit, setIsSubmittingUnit] = useState(false);

  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tList, uList] = await Promise.all([
        api.getTenants(),
        api.getUnits()
      ]);
      setTenants(tList);
      setUnits(uList);
      if (uList.length > 0 && !tenantUnitId) {
        setTenantUnitId(uList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTenant(true);
    try {
      await api.createTenant({
        full_name: tenantName,
        email: tenantEmail,
        phone: tenantPhone,
        password: tenantPassword,
        unit_id: tenantUnitId,
        lease_start: leaseStart,
        lease_end: leaseEnd,
        monthly_rent: Number(monthlyRent),
        deposit: Number(deposit),
        emergency_contact: emergencyContact,
        employer: employer,
        vehicle_info: vehicleInfo,
        pet_info: petInfo,
        notes: tenantNotes
      });
      setIsTenantModalOpen(false);
      setTenantName('');
      setTenantEmail('');
      setTenantPhone('');
      setEmergencyContact('');
      setEmployer('');
      setVehicleInfo('');
      setPetInfo('');
      setTenantNotes('');
      setFeedback('Resident onboarded and lease successfully activated!');
      loadData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(`Error onboarding resident: ${err.message}`);
    } finally {
      setIsSubmittingTenant(false);
    }
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingUnit(true);
    try {
      await api.createUnit({
        unit_number: unitNum,
        property_name: propertyName,
        property_type: propertyType,
        address: unitAddress,
        floor: floor,
        bedrooms: Number(unitBeds),
        bathrooms: Number(unitBaths),
        sq_ft: Number(unitSqFt),
        monthly_rent: Number(unitRent),
        parking_spot: parkingSpot,
        status: unitStatus,
        amenities: amenities,
        notes: unitNotes
      });
      setIsUnitModalOpen(false);
      setUnitNum('');
      setFeedback(`Property Unit ${unitNum} successfully added to portfolio!`);
      loadData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(`Error adding property unit: ${err.message}`);
    } finally {
      setIsSubmittingUnit(false);
    }
  };

  // Filtered lists based on search query
  const query = searchQuery.toLowerCase();
  const filteredUnits = units.filter(u => 
    !query || 
    u.unit_number.toLowerCase().includes(query) ||
    u.address.toLowerCase().includes(query) ||
    (u.property_name && u.property_name.toLowerCase().includes(query)) ||
    (u.property_type && u.property_type.toLowerCase().includes(query)) ||
    (u.status && u.status.toLowerCase().includes(query))
  );

  const filteredTenants = tenants.filter(t => 
    !query ||
    t.full_name.toLowerCase().includes(query) ||
    t.email.toLowerCase().includes(query) ||
    (t.unit_number && t.unit_number.toLowerCase().includes(query)) ||
    (t.phone && t.phone.toLowerCase().includes(query)) ||
    (t.employer && t.employer.toLowerCase().includes(query))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Portfolio Assets
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Austin Capital View</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
            Properties & Residents Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Register and manage apartment units, property specifications, resident profiles, lease documentation, and parking records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsUnitModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs active:scale-[0.97]"
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Add Property / Unit</span>
          </button>
          <button
            onClick={() => setIsTenantModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs active:scale-[0.97]"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>Onboard Resident</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{feedback}</span>
        </div>
      )}

      {/* Tabs and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.97] ${
              activeTab === 'properties'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Properties & Units ({units.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tenants')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.97] ${
              activeTab === 'tenants'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Residents & Leases ({tenants.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'properties' ? 'properties, units, addresses...' : 'residents, units, emails...'}`}
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* TAB 1: Properties & Units Table */}
      {activeTab === 'properties' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                Property Inventory ({filteredUnits.length} of {units.length})
              </h3>
            </div>
            <button
              onClick={() => setIsUnitModalOpen(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Unit</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-mono text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">Unit #</th>
                  <th className="py-3.5 px-4">Property / Building</th>
                  <th className="py-3.5 px-4">Layout & Specs</th>
                  <th className="py-3.5 px-4">Parking & Level</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Amenities</th>
                  <th className="py-3.5 px-6 text-right">Standard Rent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mx-auto mb-2" />
                      Loading property inventory...
                    </td>
                  </tr>
                ) : filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No property units found matching your search.
                    </td>
                  </tr>
                ) : filteredUnits.map((u) => {
                  const isOccupied = (u.status || '').toLowerCase() === 'occupied' || tenants.some(t => t.unit_id === u.id || t.unit_number === u.unit_number);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-900 border border-slate-200 px-2 py-0.5 rounded-lg text-xs">
                          Unit {u.unit_number}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900">{u.property_name || 'Capital View Residences'}</p>
                        <p className="text-[11px] text-slate-500 font-mono truncate max-w-xs">{u.address}</p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                        <span className="font-semibold">{u.bedrooms} Bed</span> • <span>{u.bathrooms} Bath</span>
                        <span className="text-slate-400 font-mono text-[11px] ml-1.5">({u.sq_ft || 850} sqft)</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        <div>{u.floor || 'Floor 1'}</div>
                        <div className="text-slate-400 text-[10px]">{u.parking_spot ? `Spot: ${u.parking_spot}` : 'Standard lot'}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          isOccupied 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOccupied ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                          <span>{isOccupied ? 'Occupied' : 'Vacant'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={u.amenities || 'Standard fixtures'}>
                        <span className="text-[11px]">{u.amenities || 'In-unit laundry, Central AC, Balcony'}</span>
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        ${Number(u.monthly_rent).toLocaleString()}/mo
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Residents & Leases Table */}
      {activeTab === 'tenants' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                Active Residents ({filteredTenants.length} of {tenants.length})
              </h3>
            </div>
            <button
              onClick={() => setIsTenantModalOpen(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Onboard Resident</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-mono text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">Resident Details</th>
                  <th className="py-3.5 px-4">Assigned Unit</th>
                  <th className="py-3.5 px-4">Emergency & Work</th>
                  <th className="py-3.5 px-4">Vehicle & Pets</th>
                  <th className="py-3.5 px-4">Lease Status</th>
                  <th className="py-3.5 px-4">Monthly Rent</th>
                  <th className="py-3.5 px-6 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mx-auto mb-2" />
                      Loading resident directory...
                    </td>
                  </tr>
                ) : filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No residents found matching your search.
                    </td>
                  </tr>
                ) : filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <p className="font-bold text-slate-900">{t.full_name}</p>
                      <p className="text-[11px] text-emerald-700 font-mono">{t.email}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{t.phone || '(512) 555-0100'}</p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        Unit {t.unit_number || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px] whitespace-nowrap">
                      <div><span className="text-slate-400">Employer:</span> {t.employer || 'Not specified'}</div>
                      <div><span className="text-slate-400">Emergency:</span> {t.emergency_contact || 'None listed'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px] whitespace-nowrap">
                      <div><span className="text-slate-400">Vehicle:</span> {t.vehicle_info || 'None'}</div>
                      <div><span className="text-slate-400">Pets:</span> {t.pet_info || 'None'}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                        {t.lease_status || 'active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {t.monthly_rent ? `$${Number(t.monthly_rent).toLocaleString()}/mo` : '$1,850/mo'}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString([], { dateStyle: 'short' }) : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Property / Unit (Comprehensive Details) */}
      <Modal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        title="Add Property / Apartment Unit to Portfolio"
      >
        <form onSubmit={handleCreateUnit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Number / Identifier *</label>
              <input
                type="text"
                required
                value={unitNum}
                onChange={(e) => setUnitNum(e.target.value)}
                placeholder="e.g. Unit 5C"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Building / Property Name</label>
              <input
                type="text"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                placeholder="e.g. Capital View Residences"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="Apartment">Apartment</option>
                <option value="Condo">Condominium</option>
                <option value="Townhome">Townhome</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Studio">Studio</option>
                <option value="Commercial">Commercial / Retail</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Floor / Wing</label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="e.g. Floor 2, East Wing"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Occupancy Status</label>
              <select
                value={unitStatus}
                onChange={(e) => setUnitStatus(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="Vacant">Vacant - Move-in Ready</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Under Turnover Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Street Address *</label>
            <input
              type="text"
              required
              value={unitAddress}
              onChange={(e) => setUnitAddress(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bedrooms</label>
              <input
                type="number"
                min={0}
                value={unitBeds}
                onChange={(e) => setUnitBeds(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bathrooms</label>
              <input
                type="number"
                step="0.5"
                min={1}
                value={unitBaths}
                onChange={(e) => setUnitBaths(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sq Footage</label>
              <input
                type="number"
                value={unitSqFt}
                onChange={(e) => setUnitSqFt(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Rent ($)</label>
              <input
                type="number"
                value={unitRent}
                onChange={(e) => setUnitRent(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Parking Bay / Spot</label>
              <input
                type="text"
                value={parkingSpot}
                onChange={(e) => setParkingSpot(e.target.value)}
                placeholder="e.g. Bay #14 (Covered)"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Amenities & Features</label>
              <input
                type="text"
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                placeholder="e.g. In-unit washer, balcony, central AC"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Key Codes & Access Notes</label>
            <input
              type="text"
              value={unitNotes}
              onChange={(e) => setUnitNotes(e.target.value)}
              placeholder="e.g. Smart lock code #9142. Lockbox on back patio."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUnitModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingUnit}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-sm disabled:opacity-50 transition-all active:scale-[0.97]"
            >
              {isSubmittingUnit ? 'Registering...' : 'Add Property Unit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Onboard Resident (Comprehensive Details) */}
      <Modal
        isOpen={isTenantModalOpen}
        onClose={() => setIsTenantModalOpen(false)}
        title="Onboard Resident & Create Active Tenancy Lease"
      >
        <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="e.g. Johnny Cash"
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address (Portal Login) *</label>
              <input
                type="email"
                required
                value={tenantEmail}
                onChange={(e) => setTenantEmail(e.target.value)}
                placeholder="resident@email.com"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Phone Number *</label>
              <input
                type="text"
                required
                value={tenantPhone}
                onChange={(e) => setTenantPhone(e.target.value)}
                placeholder="(512) 555-0104"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assign Property / Unit *</label>
              <select
                value={tenantUnitId}
                onChange={(e) => setTenantUnitId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>Unit {u.unit_number} - {u.property_name || 'Capital View'} ({u.address})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Resident Password *</label>
              <input
                type="text"
                required
                value={tenantPassword}
                onChange={(e) => setTenantPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lease Start</label>
              <input
                type="date"
                required
                value={leaseStart}
                onChange={(e) => setLeaseStart(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lease End</label>
              <input
                type="date"
                required
                value={leaseEnd}
                onChange={(e) => setLeaseEnd(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rent ($/mo)</label>
              <input
                type="number"
                required
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Deposit ($)</label>
              <input
                type="number"
                required
                value={deposit}
                onChange={(e) => setDeposit(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emergency Contact (Name & Phone)</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="e.g. Jane Doe (Sister) - (512) 555-0992"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employer / Occupation</label>
              <input
                type="text"
                value={employer}
                onChange={(e) => setEmployer(e.target.value)}
                placeholder="e.g. Lead Designer at Canva"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vehicle Details</label>
              <input
                type="text"
                value={vehicleInfo}
                onChange={(e) => setVehicleInfo(e.target.value)}
                placeholder="e.g. 2023 Tesla Model Y (TX #ABC-1234)"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pets & Co-occupants</label>
              <input
                type="text"
                value={petInfo}
                onChange={(e) => setPetInfo(e.target.value)}
                placeholder="e.g. 1 Dog (Labrador, 35 lbs)"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Additional Tenancy Notes</label>
            <input
              type="text"
              value={tenantNotes}
              onChange={(e) => setTenantNotes(e.target.value)}
              placeholder="e.g. Keycard #482 issued. Auto-pay active."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTenantModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingTenant}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-sm disabled:opacity-50 transition-all active:scale-[0.97]"
            >
              {isSubmittingTenant ? 'Onboarding...' : 'Onboard Resident & Lease'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
