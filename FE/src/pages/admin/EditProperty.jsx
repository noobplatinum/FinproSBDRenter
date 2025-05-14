import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiUpload, FiX, FiPlus, FiTrash2, FiInfo, FiLoader, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminEditProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_per_night: '',
    location: '',
    type: 'apartment',
    max_guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    status: 'active',
  });
  
  const [facilities, setFacilities] = useState([]);
  const [images, setImages] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [newFacility, setNewFacility] = useState({ name: '', available: true, condition: 'good' });
  const [isAddingFacility, setIsAddingFacility] = useState(false);
  
  // Fetch property details
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, you would use API call:
        // const response = await axios.get(`http://localhost:3000/api/properties/${id}`);
        
        // For development/demo
        setTimeout(() => {
          // Dummy property data
          const demoProperty = {
            id: parseInt(id),
            title: `Property ${id}`,
            description: `This is a detailed description of property ${id}. It features multiple rooms, a beautiful view, and is located in a prime area.`,
            type: ['Apartment', 'House', 'Villa', 'Kost', 'Cottage'][Math.floor(Math.random() * 5)].toLowerCase(),
            location: ['Jakarta', 'Bandung', 'Surabaya', 'Bali', 'Yogyakarta'][Math.floor(Math.random() * 5)],
            price_per_night: Math.floor(Math.random() * 1500000) + 500000,
            owner_id: Math.floor(Math.random() * 10) + 1,
            owner_name: ['John Smith', 'Sarah Johnson', 'Michael Lee', 'Maria Garcia', 'David Chen'][Math.floor(Math.random() * 5)],
            max_guests: Math.floor(Math.random() * 8) + 2,
            bedrooms: Math.floor(Math.random() * 5) + 1,
            bathrooms: Math.floor(Math.random() * 3) + 1,
            status: ['active', 'pending', 'inactive'][Math.floor(Math.random() * 3)],
            images: Array(Math.floor(Math.random() * 5) + 2).fill().map((_, index) => ({
              id: index + 1,
              url: `https://source.unsplash.com/random/800x600?house&sig=${id}-${index}`,
              is_main: index === 0
            })),
            facilities: [
              { id: 1, name: 'WiFi', available: true, condition: 'good' },
              { id: 2, name: 'AC', available: true, condition: 'excellent' },
              { id: 3, name: 'Kitchen', available: Math.random() > 0.5, condition: Math.random() > 0.5 ? 'good' : 'n/a' },
              { id: 4, name: 'Parking', available: Math.random() > 0.5, condition: Math.random() > 0.5 ? 'good' : 'n/a' },
              { id: 5, name: 'Pool', available: Math.random() > 0.5, condition: Math.random() > 0.5 ? 'excellent' : 'n/a' },
            ]
          };
          
          setFormData({
            title: demoProperty.title,
            description: demoProperty.description,
            price_per_night: demoProperty.price_per_night,
            location: demoProperty.location,
            type: demoProperty.type,
            max_guests: demoProperty.max_guests,
            bedrooms: demoProperty.bedrooms,
            bathrooms: demoProperty.bathrooms,
            status: demoProperty.status,
          });
          
          setFacilities(demoProperty.facilities);
          
          const propertyImages = demoProperty.images.map(img => ({
            id: img.id,
            url: img.url,
            isMain: img.is_main,
            isExisting: true
          }));
          
          setImages(propertyImages);
          setOriginalImages(propertyImages);
          setIsLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching property:', error);
        setError('Failed to fetch property details. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchPropertyDetails();
  }, [id]);
  
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 10 images
    if (images.length + files.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }
    
    // Preview images
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isMain: images.length === 0,
      isExisting: false
    }));
    
    setImages(prev => [...prev, ...newImages]);
    setImageFiles(prev => [...prev, ...files]);
  };
  
  const removeImage = (index) => {
    const newImages = [...images];
    const imageToRemove = newImages[index];
    
    // If removing main image, set first remaining image as main
    if (imageToRemove.isMain && newImages.length > 1) {
      const nextIndex = index === newImages.length - 1 ? 0 : index + 1;
      newImages[nextIndex].isMain = true;
    }
    
    // If it's an existing image, add it to remove list for backend
    if (imageToRemove.isExisting) {
      setImagesToRemove(prev => [...prev, imageToRemove.id]);
    } else {
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(imageToRemove.preview);
      
      // Remove from imageFiles
      const newImageFiles = [...imageFiles];
      const fileIndex = newImageFiles.findIndex((_, i) => {
        const nonExistingImagesUpToIndex = images
          .slice(0, index)
          .filter(img => !img.isExisting).length;
        return i === nonExistingImagesUpToIndex;
      });
      
      if (fileIndex !== -1) {
        newImageFiles.splice(fileIndex, 1);
        setImageFiles(newImageFiles);
      }
    }
    
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const setMainImage = (index) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    setImages(newImages);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!formData.location.trim()) {
      toast.error('Location is required');
      return;
    }
    
    if (!formData.price_per_night || formData.price_per_night <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    
    if (images.length === 0) {
      toast.error('At least one image is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, you would use FormData to upload images along with property data
      /*
      const propertyData = new FormData();
      
      // Append property details
      Object.keys(formData).forEach(key => {
        propertyData.append(key, formData[key]);
      });
      
      // Append facilities
      propertyData.append('facilities', JSON.stringify(facilities));
      
      // Append images to remove
      if (imagesToRemove.length > 0) {
        propertyData.append('imagesToRemove', JSON.stringify(imagesToRemove));
      }
      
      // Append new images
      imageFiles.forEach(file => {
        propertyData.append('images', file);
      });
      
      // Set main image
      const mainImageIndex = images.findIndex(img => img.isMain);
      if (mainImageIndex !== -1) {
        const mainImage = images[mainImageIndex];
        if (mainImage.isExisting) {
          propertyData.append('mainImageId', mainImage.id);
        } else {
          propertyData.append('mainImageIndex', imageFiles.indexOf(mainImage.file));
        }
      }
      
      const response = await axios.put(`http://localhost:3000/api/properties/${id}`, propertyData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      */
      
      // For development/demo
      setTimeout(() => {
        toast.success('Property updated successfully');
        navigate('/admin/properties');
      }, 1500);
      
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error(error.response?.data?.message || 'Failed to update property');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFacilityChange = (index, field, value) => {
    const updatedFacilities = [...facilities];
    updatedFacilities[index][field] = value;
    
    // Reset condition if facility is not available
    if (field === 'available' && value === false) {
      updatedFacilities[index].condition = 'n/a';
    } else if (field === 'available' && value === true && updatedFacilities[index].condition === 'n/a') {
      updatedFacilities[index].condition = 'good';
    }
    
    setFacilities(updatedFacilities);
  };
  
  const handleNewFacilityChange = (field, value) => {
    setNewFacility(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'available' && value === false) {
      setNewFacility(prev => ({
        ...prev,
        condition: 'n/a'
      }));
    }
  };
  
  const addFacility = () => {
    if (!newFacility.name.trim()) {
      toast.error('Facility name is required');
      return;
    }
    
    // Check if facility already exists
    if (facilities.some(f => f.name.toLowerCase() === newFacility.name.toLowerCase())) {
      toast.error('Facility already exists');
      return;
    }
    
    // In a real application, you might generate a temporary ID or handle this differently
    const newFacilityWithId = {
      ...newFacility,
      id: `new-${Date.now()}`
    };
    
    setFacilities([...facilities, newFacilityWithId]);
    setNewFacility({ name: '', available: true, condition: 'good' });
    setIsAddingFacility(false);
  };
  
  const removeFacility = (index) => {
    const updatedFacilities = [...facilities];
    updatedFacilities.splice(index, 1);
    setFacilities(updatedFacilities);
  };
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (!image.isExisting && image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, []);
  
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <button
            onClick={() => navigate('/admin/properties')}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/admin/properties')}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Property</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
          {/* Left Column */}
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Details</h2>
              
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Cozy Apartment in Kemang"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your property..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price_per_night" className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Night (IDR) *
                  </label>
                  <input
                    type="number"
                    id="price_per_night"
                    name="price_per_night"
                    value={formData.price_per_night}
                    onChange={handleInputChange}
                    min="0"
                    step="10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="500000"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Kemang, Jakarta Selatan"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Property Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="kost">Kost</option>
                    <option value="cottage">Cottage</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="max_guests" className="block text-sm font-medium text-gray-700 mb-1">
                    Max Guests
                  </label>
                  <input
                    type="number"
                    id="max_guests"
                    name="max_guests"
                    value={formData.max_guests}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    id="bathrooms"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Property Status</h2>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active (Available for booking)</option>
                  <option value="pending">Pending (Requires approval)</option>
                  <option value="inactive">Inactive (Not available)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Images</h2>
              
              <div className="mb-2 flex items-center">
                <label htmlFor="image-upload" className="cursor-pointer bg-white border border-gray-300 rounded-md px-4 py-2 flex items-center text-gray-700 hover:bg-gray-50">
                  <FiUpload className="mr-2" />
                  <span>Upload Images</span>
                  <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </label>
                <div className="ml-3 text-sm text-gray-500">
                  Max 10 images. Click on an image to set as main thumbnail.
                </div>
              </div>
              
              {images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className={`relative rounded-md overflow-hidden border-2 ${
                        image.isMain ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image.isExisting ? image.url : image.preview}
                        alt={`Property ${index + 1}`}
                        className="h-32 w-full object-cover cursor-pointer"
                        onClick={() => setMainImage(index)}
                      />
                      {image.isMain && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                          Main
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-8 mt-4 text-center">
                  <FiUpload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Upload at least one image of your property</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Facilities</h2>
                <button
                  type="button"
                  onClick={() => setIsAddingFacility(true)}
                  className="flex items-center text-blue-600 text-sm hover:text-blue-800"
                >
                  <FiPlus className="mr-1" /> Add Facility
                </button>
              </div>
              
              {facilities.length > 0 ? (
                <div className="space-y-3">
                  {facilities.map((facility, index) => (
                    <div key={facility.id || index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <div className="flex-grow grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <div className="text-sm font-medium">{facility.name}</div>
                        </div>
                        <div>
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={facility.available}
                              onChange={(e) => handleFacilityChange(index, 'available', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
                            />
                            <span className="text-sm text-gray-700">Available</span>
                          </label>
                        </div>
                        <div>
                          <select
                            value={facility.condition}
                            onChange={(e) => handleFacilityChange(index, 'condition', e.target.value)}
                            disabled={!facility.available}
                            className="text-sm p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                            <option value="n/a">N/A</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFacility(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-md">
                  No facilities added
                </div>
              )}
              
              {/* Add Facility Form */}
              {isAddingFacility && (
                <div className="mt-4 p-4 border border-blue-200 bg-blue-50 rounded-md">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-blue-800">Add New Facility</h3>
                    <button
                      type="button"
                      onClick={() => setIsAddingFacility(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <input
                        type="text"
                        value={newFacility.name}
                        onChange={(e) => handleNewFacilityChange('name', e.target.value)}
                        placeholder="Facility name"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={newFacility.available}
                          onChange={(e) => handleNewFacilityChange('available', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
                        />
                        <span className="text-sm text-gray-700">Available</span>
                      </label>
                    </div>
                    <div>
                      <select
                        value={newFacility.condition}
                        onChange={(e) => handleNewFacilityChange('condition', e.target.value)}
                        disabled={!newFacility.available}
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                        <option value="n/a">N/A</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={addFacility}
                    className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <FiPlus className="inline-block mr-1" /> Add
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-500">
              <FiInfo className="mr-1" />
              Fields marked with * are required
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/properties')}
                className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" /> Update Property
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminEditProperty;