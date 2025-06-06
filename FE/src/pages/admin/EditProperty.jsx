import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiUpload, FiX, FiPlus, FiTrash2, FiInfo, FiLoader, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import api from '../../services/api';  
const AdminEditProperty = () => {
  const navigate = useNavigate();
  const { id: propertyId } = useParams(); // Menggunakan propertyId agar lebih jelas

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_per_night: '',
    location: '',
    category: 'apartment', // Diganti dari 'type' agar konsisten dengan AddProperty
    max_guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    status: 'active', // 'status' mungkin lebih cocok daripada is_available
    size: '',         // Tambahkan size jika ada di model properti
    is_featured: false, // Tambahkan jika ada
  });

  // State untuk fasilitas
  // Setiap facility akan memiliki: { id (dari DB), property_id, name, condition, available (frontend flag) }
  const [facilities, setFacilities] = useState([]);
  const [originalFacilities, setOriginalFacilities] = useState([]); // Untuk melacak perubahan

  // State untuk gambar
  // Setiap image akan memiliki: { id (dari DB jika ada), url (dari DB atau preview), isMain, isExisting, file (untuk gambar baru) }
  const [images, setImages] = useState([]);
  const [imageFilesToUpload, setImageFilesToUpload] = useState([]); // Hanya file baru yang akan diupload
  const [imageIdsToRemove, setImageIdsToRemove] = useState([]);   // ID gambar dari DB yang akan dihapus

  const [newFacility, setNewFacility] = useState({ name: '', condition: 'berfungsi' }); // available tidak perlu di sini
  const [isAddingFacility, setIsAddingFacility] = useState(false);


  // --- Fetch Property Details ---
  useEffect(() => {
    const fetchPropertyDetails = async () => {
  setIsLoading(true);
  setError(null);
  try {
    // 1. Fetch property data using your API service
    const propertyResponse = await api.get(`/properties/${propertyId}`);
    const propertyData = propertyResponse.data?.data || propertyResponse.data;
    console.log("Fetched Property Data:", propertyData);

    if (!propertyData) {
      throw new Error("Property data not found in response.");
    }

    // 2. Fetch facilities data
    const facilitiesResponse = await api.get(`/facilities/property/${propertyId}`);
    const facilitiesData = facilitiesResponse.data?.data || facilitiesResponse.data || [];
    console.log("Fetched Facilities Data:", facilitiesData);

    // 3. Fetch images data
    const imagesResponse = await api.get(`/images/property/${propertyId}`);
    const imagesData = imagesResponse.data?.data || imagesResponse.data || [];
    console.log("Fetched Images Data:", imagesData);

    // Set form data
    setFormData({
      title: propertyData.title || '',
      description: propertyData.description || '',
      price_per_night: propertyData.price_per_night || '',
      location: propertyData.location || '',
      category: propertyData.category || 'apartment',
      max_guests: propertyData.max_guests || 2,
      bedrooms: propertyData.bedrooms || 1,
      bathrooms: propertyData.bathrooms || 1,
      status: propertyData.status || 'active',
      size: propertyData.size || '',
      is_featured: propertyData.is_featured || false,
    });

    // Set facilities
    const formattedFacilities = Array.isArray(facilitiesData) ? facilitiesData.map(fac => ({
      id: fac.id,
      property_id: fac.property_id,
      name: fac.name,
      condition: fac.condition || 'excellent',
      available: true,
      isExisting: true,
    })) : [];
    setFacilities(formattedFacilities);
    setOriginalFacilities(JSON.parse(JSON.stringify(formattedFacilities)));

    // Set images - ensure full URL paths
    const propertyImages = Array.isArray(imagesData) ? imagesData.map(img => ({
      id: img.id,
      // Make sure we have a full URL here
      url: img.url.startsWith('http') ? img.url : `https://finpro-sbd-renter-backend.vercel.app${img.url}`,
      isMain: img.is_thumbnail || false,
      isExisting: true,
      file: null
    })) : [];
    setImages(propertyImages);

  } catch (err) {
    console.error('Error fetching property details:', err.response?.data || err.message);
    setError('Failed to fetch property details. Please try again later.');
    toast.error('Failed to load property details.');
  } finally {
    setIsLoading(false);
  }
};

    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId]);

  // --- Handle Input Change ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' && value !== '' ? Number(value) : value)
    }));
  };

  // --- Handle Image Upload (untuk gambar BARU) ---
  const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);

  if (images.length + files.length > 10) {
    toast.error(`Maximum 10 images allowed. You currently have ${images.length} and are trying to add ${files.length}.`);
    return;
  }
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const oversizedFiles = files.filter(file => file.size > MAX_SIZE);
  if (oversizedFiles.length > 0) {
    toast.error(`${oversizedFiles.length} image(s) exceed the 5MB size limit.`);
    return;
  }
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  const invalidFiles = files.filter(file => !validTypes.includes(file.type));
  if (invalidFiles.length > 0) {
    toast.error(`${invalidFiles.length} file(s) are not valid image types (allowed: JPG, PNG, WEBP).`);
    return;
  }

  // Create temporary entries with preview URLs
  const newImageObjects = files.map(file => {
    const previewUrl = URL.createObjectURL(file);
    console.log("Created preview URL:", previewUrl);
    return {
      id: null,
      url: previewUrl,
      isMain: images.length === 0, // First image becomes main if no images exist
      isExisting: false,
      file: file
    };
  });

  setImages(prev => [...prev, ...newImageObjects]);
  setImageFilesToUpload(prev => [...prev, ...files]);
};

  // --- Remove Image ---
  const removeImage = (indexToRemove) => {
    const imageToRemove = images[indexToRemove];

    if (imageToRemove.isExisting) {
      // Jika gambar dari DB, tambahkan ID-nya ke daftar yang akan dihapus di backend
      setImageIdsToRemove(prev => [...prev, imageToRemove.id]);
    } else {
      // Jika gambar baru (preview), hapus file dari imageFilesToUpload dan revoke object URL
      URL.revokeObjectURL(imageToRemove.url);
      setImageFilesToUpload(prevFiles => prevFiles.filter(file => file !== imageToRemove.file));
    }

    const updatedImages = images.filter((_, index) => index !== indexToRemove);

    // Jika gambar yang dihapus adalah main, dan masih ada gambar lain, jadikan gambar pertama sebagai main
    if (imageToRemove.isMain && updatedImages.length > 0 && !updatedImages.some(img => img.isMain)) {
      updatedImages[0].isMain = true;
    }

    setImages(updatedImages);
  };

  // --- Set Main Image ---
  const setMainImage = (indexToSetMain) => {
    setImages(prevImages =>
      prevImages.map((img, i) => ({
        ...img,
        isMain: i === indexToSetMain,
      }))
    );
  };

  // --- Facility Handlers ---
  const handleFacilityChange = (index, field, value) => {
    const updatedFacilities = [...facilities];
    const facility = updatedFacilities[index];
    facility[field] = value;

    // Jika facility di-uncheck (available: false), set 'isExisting' jadi false
    // agar bisa dideteksi sebagai fasilitas yang akan dihapus/diupdate statusnya.
    // Backend perlu logika untuk menghapus facility link jika tidak dikirim atau 'available: false'.
    // Atau, Anda bisa mengirim semua fasilitas dan backend yang menentukan.
    if (field === 'available') {
        if (value === false && facility.isExisting) {
            // Tandai untuk dihapus atau di-nonaktifkan di backend
            // Mungkin perlu field 'toBeRemoved' atau backend menghapus yg tidak ada di list akhir
        }
    }
    setFacilities(updatedFacilities);
  };

  const handleNewFacilityNameChange = (value) => {
    setNewFacility(prev => ({ ...prev, name: value }));
  };
  const handleNewFacilityConditionChange = (value) => {
    setNewFacility(prev => ({ ...prev, condition: value }));
  };


const addFacility = () => {
  if (!newFacility.name.trim()) {
    toast.error('Facility name cannot be empty.');
    return;
  }
  
  if (facilities.some(f => f.name.toLowerCase() === newFacility.name.toLowerCase())) {
    toast.error(`Facility "${newFacility.name}" already exists.`);
    return;
  }
  
  setFacilities(prev => [
    ...prev,
    {
      id: `new-${Date.now()}`, // Temporary ID for UI
      name: newFacility.name,
      condition: newFacility.condition,
      available: true,
      isExisting: false // This is a new facility
    }
  ]);
  
  setNewFacility({ name: '', condition: 'berfungsi' });
  setIsAddingFacility(false);
};

const removeFacility = (index) => {
  setFacilities(prev => prev.filter((_, i) => i !== index));
};


const handleSubmit = async (e) => {
  e.preventDefault();
  
  setIsSubmitting(true);
  
  try {
    const token = localStorage.getItem('token');
    
    await axios.put(
      `https://finpro-sbd-renter-backend.vercel.app/api/properties/${propertyId}`,
      {
        title: formData.title,
        description: formData.description,
        price_per_night: Number(formData.price_per_night),
        location: formData.location,
        category: formData.category,
        max_guests: Number(formData.max_guests),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        is_available: formData.status === 'active',
        size: formData.size || null
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    const activeFacilities = facilities.filter(f => f.available);

    for (const facility of activeFacilities) {
      if (facility.isExisting) {
        await axios.put(
          `https://finpro-sbd-renter-backend.vercel.app/api/facilities/${facility.id}`,
          {
            name: facility.name,
            condition: facility.condition
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        await axios.post(
          'https://finpro-sbd-renter-backend.vercel.app/api/facilities',
          {
            property_id: propertyId,
            name: facility.name,
            condition: facility.condition
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
    }

    if (imageIdsToRemove.length > 0) {
      for (const imageId of imageIdsToRemove) {
        try {
          await axios.delete(`https://finpro-sbd-renter-backend.vercel.app/api/images/${imageId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (err) {
          console.error(`Failed to delete image ${imageId}:`, err);
        }
      }
    }
    
    let newImageUploaded = false;
    if (imageFilesToUpload.length > 0) {
      newImageUploaded = true;
      const imagesFormData = new FormData();
      imagesFormData.append('property_id', propertyId);
      
      imageFilesToUpload.forEach(file => {
        imagesFormData.append('images', file);
      });
      
      try {
        await axios.post('https://finpro-sbd-renter-backend.vercel.app/api/images/upload/multiple', imagesFormData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' 
          }
        });
      } catch (err) {
        console.error('Failed to upload images:', err);
        toast.error('Some images could not be uploaded');
      }
    }
    
    const mainImage = images.find(img => img.isMain && img.isExisting);
    if (mainImage) {
      try {
        await axios.options(`https://finpro-sbd-renter-backend.vercel.app/api/properties/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        await axios.put(
          `https://finpro-sbd-renter-backend.vercel.app/api/images/${mainImage.id}/set-thumbnail`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error('Failed to set thumbnail:', err);
        
        try {
          await axios.put(
            `https://finpro-sbd-renter-backend.vercel.app/api/properties/${propertyId}`,
            { thumbnail_id: mainImage.id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (altErr) {
          console.error('Alternative thumbnail setting also failed:', altErr);
        }
      }
    } else if (newImageUploaded) {
      toast.info('New images uploaded. You may need to set the main image after refresh.');
    }
    
    toast.success('Property updated successfully!');
    navigate('/admin/properties');
  } catch (err) {
    console.error('Error updating property:', err.response?.data || err.message);
    toast.error(err.response?.data?.message || 'Failed to update property.');
  } finally {
    setIsSubmitting(false);
  }
};

  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (!image.isExisting && image.url) { // Hanya revoke untuk preview gambar baru
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [images]); // Jalankan ketika images berubah
  
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
          src={image.url}
          alt={`Property ${index + 1}`}
          className="h-32 w-full object-cover cursor-pointer"
          onClick={() => setMainImage(index)}
          onError={(e) => {
            console.error("Image failed to load:", image.url);
            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
          }}
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