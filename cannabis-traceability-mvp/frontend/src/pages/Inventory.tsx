import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import { useModule } from '../context/ModuleContext';
import { api } from '../lib/api';
import { Package as PackageIcon, Scissors, Plus, X, ChevronDown, Trash2, AlertTriangle } from 'lucide-react';

export default function Inventory() {
  const { activeModule } = useModule();
  const [harvests, setHarvests] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [formData, setFormData] = useState<any>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null);

  // Cannabis inventory categories and subcategories
  const inventoryCategories = {
    'Live Plants': ['Seeds', 'Clones'],
    'Growing Supplies': ['Nutrients', 'Growing Medium']
  };

  const itemTypes = {
    'Live Plants': {
      'Seeds': ['Regular Seeds', 'Feminized Seeds', 'Autoflower Seeds'],
      'Clones': [] // No item types needed for clones
    },
    'Growing Supplies': {
      'Nutrients': ['Base Nutrients', 'Supplements', 'pH Adjusters', 'Cal-Mag'],
      'Growing Medium': ['Soil', 'Coco Coir', 'Perlite', 'Vermiculite', 'Rockwool']
    }
  };

  useEffect(() => {
    if (activeModule === 'cannabis') {
      api.getHarvests().then(setHarvests);
      // Fetch all structures for storage location dropdown
      api.getAllStructures().then(setStructures);
      // Fetch inventory items
      api.getInventoryItems().then(setInventoryItems);
    } else {
      setHarvests([]);
      setFacilities([]);
      setStructures([]);
      setInventoryItems([]);
    }
  }, [activeModule]);

  const summary = useMemo(() => {
    const drying = harvests.filter((h) => h.status === 'drying').length;
    const dried = harvests.filter((h) => h.status === 'dried').length;
    return { drying, dried };
  }, [harvests]);

  // Generate storage location options from structures with detailed locations
  const getStorageLocationOptions = () => {
    const options: string[] = [];
    
    structures.forEach((structure) => {
      const facilityName = structure.facility?.name || 'Unknown Facility';
      const geoName = structure.facility?.geo?.name || 'Unknown Location';
      const baseLocation = `${structure.name} - ${facilityName} - ${geoName}`;
      
      // Add the main room/structure for all items
      options.push(baseLocation);
      
      // For Live Plants (Seeds/Clones), add specific detailed locations
      if (selectedCategory === 'Live Plants') {
        // Add tents if they exist
        if (structure.tents && structure.tents.length > 0) {
          structure.tents.forEach((tent: any, index: number) => {
            options.push(`${baseLocation} - Tent ${index + 1} (${tent.widthFt}x${tent.lengthFt}ft)`);
          });
        }
        
        // Add racks if they exist (useful for clones and seedlings)
        if (structure.racks && structure.racks.length > 0) {
          structure.racks.forEach((rack: any, rackIndex: number) => {
            // Add the rack itself
            options.push(`${baseLocation} - Rack ${rackIndex + 1} (${rack.widthCm}x${rack.lengthCm}cm)`);
            // Add individual shelves for detailed tracking
            for (let shelf = 1; shelf <= rack.shelves; shelf++) {
              options.push(`${baseLocation} - Rack ${rackIndex + 1} - Shelf ${shelf}`);
            }
          });
        }
      }
      // For other categories (Growing Supplies), the basic structure location is sufficient
    });
    
    return options;
  };

  // Validate individual field
  const validateField = (name: string, value: any, field: any) => {
    if (!field.required) return true;
    
    if (field.type === 'select') {
      return value && value.trim() !== '';
    } else if (field.type === 'number') {
      return value !== '' && value !== null && value !== undefined && !isNaN(Number(value)) && Number(value) >= 0;
    } else if (field.type === 'date') {
      return value && value.trim() !== '';
    } else if (field.type === 'file') {
      return value && value.trim() !== '';
    } else {
      return value && value.trim() !== '';
    }
  };

  // Update field errors in real-time
  const updateFieldErrors = () => {
    const allFields = getFormFields();
    const errors: Record<string, boolean> = {};
    
    // Check category and subcategory
    errors['category'] = !selectedCategory;
    errors['subcategory'] = !selectedSubcategory;
    
    // Item type is not required for Clones
    if (!(selectedCategory === 'Live Plants' && selectedSubcategory === 'Clones')) {
      errors['itemType'] = !formData.itemType;
    }
    
    // Check all form fields
    allFields.forEach(field => {
      const isValid = validateField(field.name, formData[field.name], field);
      errors[field.name] = !isValid;
    });
    
    setFieldErrors(errors);
  };

  // Update validation whenever form data changes
  useEffect(() => {
    updateFieldErrors();
  }, [formData, selectedCategory, selectedSubcategory]);

  // Handle input changes with validation
  const handleInputChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  // Get form fields based on selected category/subcategory
  const getFormFields = () => {
    if (!selectedCategory || !selectedSubcategory) return [];

    const baseFields: Array<{name: string, label: string, type: string, required?: boolean, options?: string[], step?: string}> = [
      { name: 'name', label: 'Item Name', type: 'text', required: true },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true },
      // Storage location - always a dropdown with available storage rooms
      { name: 'location', label: 'Storage Location', type: 'select', options: getStorageLocationOptions(), required: true },
    ];

    // Add unit field only if not Seeds or Clones
    if (!(selectedCategory === 'Live Plants' && (selectedSubcategory === 'Seeds' || selectedSubcategory === 'Clones'))) {
      baseFields.splice(2, 0, { name: 'unit', label: 'Unit', type: 'select', options: ['pieces', 'grams', 'ounces', 'pounds', 'liters', 'milliliters'], required: true });
    }

    // Add supplier/source only if not Clones
    if (!(selectedCategory === 'Live Plants' && selectedSubcategory === 'Clones')) {
      baseFields.push(
        { name: 'supplier', label: 'Supplier/Source', type: 'text', required: true }
      );
    }

    // Add purchase/cutting date
    baseFields.push(
      selectedCategory === 'Live Plants' && selectedSubcategory === 'Clones'
        ? { name: 'purchaseDate', label: 'Cutting Date', type: 'date', required: true }
        : { name: 'purchaseDate', label: 'Purchase/Acquisition Date', type: 'date', required: true }
    );

    // Add expiry date and cost only if not Clones
    if (!(selectedCategory === 'Live Plants' && selectedSubcategory === 'Clones')) {
      baseFields.push(
        { name: 'expiryDate', label: 'Expiry Date', type: 'date', required: true },
        { name: 'cost', label: 'Cost ($)', type: 'number', step: '0.01', required: true }
      );
    }

    let specificFields: typeof baseFields = [];

    // Category-specific fields
    if (selectedCategory === 'Live Plants') {
      specificFields = [
        { name: 'strain', label: 'Strain/Variety', type: 'text', required: true },
        { name: 'genetics', label: 'Genetics (Indica/Sativa/Hybrid)', type: 'select', options: ['Indica', 'Sativa', 'Hybrid'], required: true },
        { name: 'breeder', label: 'Breeder', type: 'text', required: true },
      ];
      
      // Only add planted date and mother plant ID for specific subcategories
      if (selectedSubcategory !== 'Seeds' && selectedSubcategory !== 'Clones') {
        specificFields.push(
          { name: 'plantedDate', label: 'Planted Date', type: 'date', required: true }
        );
      }
      
      // Add mother plant ID for Clones and other non-seed items
      if (selectedSubcategory !== 'Seeds') {
        specificFields.push(
          { name: 'motherPlant', label: 'Mother Plant ID', type: 'text', required: true }
        );
      }
    } else if (selectedCategory === 'Growing Supplies') {
      specificFields = [
        { name: 'brand', label: 'Brand', type: 'text', required: true },
        { name: 'model', label: 'Model/Product Code', type: 'text', required: true }
      ];
    }

    return [...specificFields, ...baseFields];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Collect all form fields
      const fields = getFormFields();
      const specificFields: Record<string, any> = {};
      
      // Separate specific fields from base fields
      const baseFieldNames = ['name', 'quantity', 'unit', 'location', 'supplier', 'purchaseDate', 'expiryDate', 'cost'];
      fields.forEach(field => {
        if (!baseFieldNames.includes(field.name) && formData[field.name]) {
          specificFields[field.name] = formData[field.name];
        }
      });

      const inventoryData = {
        name: formData.name,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        itemType: formData.itemType,
        quantity: parseInt(formData.quantity),
        unit: formData.unit || (selectedCategory === 'Live Plants' && (selectedSubcategory === 'Seeds' || selectedSubcategory === 'Clones') ? 'pieces' : ''),
        location: formData.location,
        supplier: formData.supplier,
        purchaseDate: formData.purchaseDate,
        expiryDate: formData.expiryDate,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        specificFields: Object.keys(specificFields).length > 0 ? specificFields : undefined
      };

      // Save to database
      await api.createInventoryItem(inventoryData);
      
      // Refresh inventory list
      const updatedInventoryItems = await api.getInventoryItems();
      setInventoryItems(updatedInventoryItems);
      
      // Close modal
      setShowAddModal(false);
      setSelectedCategory('');
      setSelectedSubcategory('');
      setFormData({});
      setFieldErrors({});
    } catch (error) {
      console.error('Error creating inventory item:', error);
      // You could add error handling UI here
    }
  };

  const resetModal = () => {
    setShowAddModal(false);
    setSelectedCategory('');
    setSelectedSubcategory('');
    setFormData({});
    setFieldErrors({});
  };

  const handleDeleteInventoryItem = async (id: string, itemName: string) => {
    // Show custom confirmation modal
    setItemToDelete({ id, name: itemName });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await api.deleteInventoryItem(itemToDelete.id);
      // Refresh inventory list
      const updatedInventoryItems = await api.getInventoryItems();
      setInventoryItems(updatedInventoryItems);
      
      // Close modal and reset state
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      // You could add error handling UI here
      alert('Failed to delete inventory item. Please try again.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  if (activeModule !== 'cannabis') {
    return (
      <Card>
        <p className="text-sm text-gray-700">Inventory for {activeModule} is not yet implemented in this MVP.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2">
          <PackageIcon className="h-6 w-6" aria-hidden /> Inventory
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <div className="text-sm text-gray-500">Harvest lots (drying)</div>
          <div className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2 mt-1">
            <Scissors className="h-5 w-5 text-amber-600" aria-hidden /> {summary.drying}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Harvest lots (dried)</div>
          <div className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2 mt-1">
            <Scissors className="h-5 w-5 text-emerald-700" aria-hidden /> {summary.dried}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Harvest lots</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-4">Lot</th>
                <th className="py-2 pr-4">Weight</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {harvests.slice(0, 20).map((h) => (
                <tr key={h.id} className="text-gray-800">
                  <td className="py-2 pr-4 font-mono text-xs">{h.id}</td>
                  <td className="py-2 pr-4">{h.yieldGrams} g</td>
                  <td className="py-2 pr-4 capitalize">{h.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Inventory Items Section */}
      <Card>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory Items</h2>
        {inventoryItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No inventory items added yet. Click "Add Item" to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="py-3 pr-4 font-medium">Category</th>
                  <th className="py-3 pr-4 font-medium">Subcategory</th>
                  <th className="py-3 pr-4 font-medium">Type</th>
                  <th className="py-3 pr-4 font-medium">Quantity</th>
                  <th className="py-3 pr-4 font-medium">Location</th>
                  <th className="py-3 pr-4 font-medium">Added</th>
                  <th className="py-3 pr-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventoryItems.map((item) => (
                  <tr key={item.id} className="text-gray-800 hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium">{item.name}</td>
                    <td className="py-3 pr-4">{item.category}</td>
                    <td className="py-3 pr-4">{item.subcategory}</td>
                    <td className="py-3 pr-4">{item.itemType || '-'}</td>
                    <td className="py-3 pr-4">{item.quantity} {item.unit}</td>
                    <td className="py-3 pr-4">{item.location}</td>
                    <td className="py-3 pr-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => handleDeleteInventoryItem(item.id, item.name)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add Inventory Item</h2>
              <button
                onClick={resetModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory('');
                  }}
                  required
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                    fieldErrors['category'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Category</option>
                  {Object.keys(inventoryCategories).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Subcategory Selection */}
              {selectedCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory *
                  </label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    required
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                      fieldErrors['subcategory'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Subcategory</option>
                    {inventoryCategories[selectedCategory as keyof typeof inventoryCategories].map(subcategory => (
                      <option key={subcategory} value={subcategory}>{subcategory}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Item Type Selection - Not needed for Clones */}
              {selectedCategory && selectedSubcategory && !(selectedCategory === 'Live Plants' && selectedSubcategory === 'Clones') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Type *
                  </label>
                  <select
                    value={formData.itemType || ''}
                    onChange={(e) => handleInputChange('itemType', e.target.value)}
                    required
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                      fieldErrors['itemType'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Item Type</option>
                    {(() => {
                      try {
                        const categoryData = itemTypes[selectedCategory as keyof typeof itemTypes];
                        const items = categoryData?.[selectedSubcategory as keyof typeof categoryData] as string[] | undefined;
                        return items?.map((item: string) => (
                          <option key={item} value={item}>{item}</option>
                        )) || [];
                      } catch {
                        return [];
                      }
                    })()}
                  </select>
                </div>
              )}

              {/* Dynamic Form Fields */}
              {selectedCategory && selectedSubcategory && (
                (selectedCategory === 'Live Plants' && selectedSubcategory === 'Clones') || 
                formData.itemType
              ) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFormFields().map(field => (
                    <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label} {field.required && '*'}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required={field.required}
                          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                            fieldErrors[field.name] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required={field.required}
                          rows={3}
                          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                            fieldErrors[field.name] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required={field.required}
                          step={field.step}
                          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                            fieldErrors[field.name] 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-gray-300'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Object.values(fieldErrors).some(error => error)}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Inventory Item</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-gray-900">"{itemToDelete.name}"</span>{' '}
                from the inventory?
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
