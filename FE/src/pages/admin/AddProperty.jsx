import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiUpload, FiX, FiPlus, FiTrash2, FiInfo } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminAddProperty = () => {
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_per_night: '',
    location: '',
    // Ganti 'type' menjadi 'category' agar sesuai dengan backend
    category: 'apartment',
    max_guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    // Ganti 'status' dengan 'is_available' sebagai boolean
    is_available: true,
    is_featured: false, // Tambahkan field ini jika dibutuhkan
  });
  
  const [facilities, setFacilities] = useState([
    { name: 'WiFi', available: true, condition: 'good' },
    { name: 'AC', available: true, condition: 'good' },
    { name: 'Kitchen', available: false, condition: 'n/a' },
    { name: 'Parking', available: false, condition: 'n/a' },
    { name: 'Pool', available: false, condition: 'n/a' },
  ]);
  
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [newFacility, setNewFacility] = useState({ name: '', available: true, condition: 'good' });
  const [isAddingFacility, setIsAddingFacility] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
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
    
    // Limit to 10 images total
    if (images.length + files.length > 10) {
      toast.error(`Maximum 10 images allowed (you're trying to add ${files.length} to existing ${images.length})`);
      return;
    }
    
    // Validasi ukuran file (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > MAX_SIZE);
    if (oversizedFiles.length > 0) {
      toast.error(`${oversizedFiles.length} images exceed the 5MB size limit`);
      return;
    }
    
    // Validasi tipe file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} files are not valid image types (allowed: JPG, PNG, WEBP)`);
      return;
    }
    
    // Create preview for each image and add to state
    const newImages = files.map(file => ({
      preview: URL.createObjectURL(file),
      isMain: images.length === 0 // Set first image as main if no images yet
    }));
    
    // Update state
    setImages(prev => [...prev, ...newImages]);
    setImageFiles(prev => [...prev, ...files]);
  };
  
  const removeImage = (index) => {
    const newImages = [...images];
    
    // If removing main image, set first remaining image as main
    if (newImages[index].isMain && newImages.length > 1) {
      const nextIndex = index === newImages.length - 1 ? 0 : index + 1;
      newImages[nextIndex].isMain = true;
    }
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(newImages[index].preview);
    
    newImages.splice(index, 1);
    const newImageFiles = [...imageFiles];
    newImageFiles.splice(index, 1);
    
    setImages(newImages);
    setImageFiles(newImageFiles);
  };
  
  const setMainImage = (index) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    setImages(newImages);
  };
  
  // Perbarui fungsi handleSubmit untuk mengupload gambar dengan benar
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validasi tetap sama
  if (formData.price_per_night <= 0) {
    toast.error('Price must be greater than 0');
    return;
  }
  
  if (images.length === 0) {
    toast.error('At least one image is required');
    return;
  }
  
  if (!formData.title || !formData.description || !formData.location) {
    toast.error('Please fill all required fields');
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    // Step 1: Buat properti baru
    const propertyDetails = {
      title: formData.title,
      description: formData.description,
      price_per_night: Number(formData.price_per_night),
      location: formData.location,
      category: formData.category,
      max_guests: Number(formData.max_guests),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      is_available: Boolean(formData.is_available),
      is_featured: Boolean(formData.is_featured),
      facilities: facilities.filter(f => f.available).map(f => ({
        name: f.name,
        condition: f.condition
      }))
    };
    
    const token = localStorage.getItem('token');
    const propertyResponse = await axios.post(
      'http://localhost:3000/api/properties',
      propertyDetails,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log("Property creation response:", propertyResponse.data);
    
    if (!propertyResponse.data.success) {
      throw new Error(propertyResponse.data.message || 'Failed to add property');
    }
    
    // Step 2: Upload gambar untuk properti yang sudah dibuat
    const propertyId = propertyResponse.data.data.id;
    
    if (imageFiles.length > 0) {
      const imageFormData = new FormData();
      
      // Tambahkan property_id ke FormData (penting!)
      imageFormData.append('property_id', propertyId);
      
      // Tambahkan semua gambar ke FormData dengan nama field yang benar
      // Upload thumbnail first (first image)
      if (imageFiles.length > 0) {
        const thumbnailFile = imageFiles[0];
        const singleImageFormData = new FormData();
        singleImageFormData.append('property_id', propertyId);
        singleImageFormData.append('image', thumbnailFile);
        singleImageFormData.append('is_thumbnail', 'true');
        
        try {
          const thumbnailResponse = await axios.post(
            'http://localhost:3000/api/images/upload',
            singleImageFormData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
              }
            }
          );
          console.log("Thumbnail upload response:", thumbnailResponse.data);
        } catch (thumbErr) {
          console.error("Error uploading thumbnail:", thumbErr);
        }
      }
      
      // Then append all images for multiple upload
      imageFiles.forEach((file, index) => {
        
        // Lanjutkan dengan menambah semua gambar ke multiple upload
        imageFormData.append('images', file);
      });
      
      try {
        console.log(`Uploading ${imageFiles.length} images for property ID ${propertyId}`);
        
        // Gunakan endpoint yang terbukti berhasil dari Postman
        const imageResponse = await axios.post(
          'http://localhost:3000/api/images/upload/multiple',
          imageFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        console.log("Image upload response:", imageResponse.data);
        
        if (imageResponse.data.success) {
          toast.success(`Uploaded ${imageResponse.data.data.successful} images successfully`);
        } else {
          console.warn("Multiple images upload failed:", imageResponse.data.message);
          toast.warning("Some images may not have been uploaded");
        }
      } catch (imageError) {
        console.error("Error uploading multiple images:", imageError);
        toast.error("Property saved but failed to upload images");
      }
    }
    
    toast.success('Property added successfully');
    
    // Delay navigate agar toast terlihat
    setTimeout(() => {
      navigate('/admin/properties');
    }, 1500);
    
  } catch (error) {
    console.error('Error adding property:', error);
    toast.error(error.response?.data?.message || 'Failed to add property');
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
    
    setFacilities([...facilities, newFacility]);
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
        URL.revokeObjectURL(image.preview);
      });
    };
  }, []);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Property</h1>

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
                  {/* Ubah 'type' menjadi 'category' */}
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Property Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
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
              
              {/* Ganti dropdown status dengan checkbox is_available */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_available"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
                  />
                  <label htmlFor="is_available" className="text-sm font-medium text-gray-700">
                    Available for booking
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_featured"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
                  />
                  <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                    Featured property (show on homepage)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Gambar dan Fasilitas (tidak ada perubahan) */}
          {/* ... kode yang sama untuk bagian gambar dan fasilitas ... */}
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
              
              {/* Tampilkan gambar yang diupload */}
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
                        src={image.preview}
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
            
            {/* Tampilkan fasilitas */}
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
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
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
              
              {/* Form untuk menambahkan fasilitas baru */}
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
                    <FiSave className="mr-2" /> Create Property
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

export default AdminAddProperty;