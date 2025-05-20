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
    category: 'apartment', 
    size: '',
    max_guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    is_available: true,
    is_featured: false,
  });

  const conditionOptions = ['berfungsi', 'rusak', 'maintenance'];

  const [facilities, setFacilities] = useState([
    { name: 'WiFi', available: true, condition: conditionOptions[0] },
    { name: 'AC', available: true, condition: conditionOptions[0] },
    { name: 'Kitchen', available: false, condition: conditionOptions[0] },
    { name: 'Parking', available: false, condition: conditionOptions[0] },
    { name: 'Pool', available: false, condition: conditionOptions[0] },
  ]);

  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [newFacility, setNewFacility] = useState({ name: '', available: true, condition: conditionOptions[0] });
  const [isAddingFacility, setIsAddingFacility] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' && value !== '' ? Number(value) : value)
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 10) {
      toast.error(`Maximum 10 images allowed (you're trying to add ${files.length} to existing ${images.length})`);
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

    const newImageObjects = files.map(file => ({
      preview: URL.createObjectURL(file),
      // Set main jika ini gambar pertama DAN belum ada gambar lain yang di-set sebagai main
      isMain: images.length === 0 && !images.some(img => img.isMain),
    }));

    setImages(prev => [...prev, ...newImageObjects]);
    setImageFiles(prev => [...prev, ...files]); // Simpan File object
  };

  const removeImage = (index) => {
    const imageToRemove = images[index];
    URL.revokeObjectURL(imageToRemove.preview); // Penting untuk memory management

    const updatedImages = images.filter((_, i) => i !== index);
    const updatedImageFiles = imageFiles.filter((_, i) => i !== index); // Hapus juga dari imageFiles

    // Jika gambar yang dihapus adalah main, dan masih ada gambar lain, jadikan gambar pertama sebagai main
    if (imageToRemove.isMain && updatedImages.length > 0 && !updatedImages.some(img => img.isMain)) {
      updatedImages[0].isMain = true;
    }

    setImages(updatedImages);
    setImageFiles(updatedImageFiles);
  };

  const setMainImage = (indexToSetMain) => {
    setImages(prevImages =>
      prevImages.map((img, i) => ({
        ...img,
        isMain: i === indexToSetMain,
      }))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.price_per_night !== '' && Number(formData.price_per_night) <= 0) {
      toast.error('Price must be greater than 0, or leave empty for default.');
      return;
    }
    if (images.length === 0) {
      toast.error('At least one image is required.');
      return;
    }
    if (!formData.title || !formData.location) { // Deskripsi bisa opsional
      toast.error('Please fill all required fields: Title, Location.');
      return;
    }
    if (!images.some(img => img.isMain) && images.length > 0) {
      toast.error('Please select a main image for the property.');
      return;
    }
    // Validasi untuk kolom baru
    if (Number(formData.max_guests) < 1) {
      toast.error('Max guests must be at least 1.');
      return;
    }
    if (Number(formData.bedrooms) < 0) { // Bisa 0 jika studio
      toast.error('Bedrooms cannot be negative.');
      return;
    }
    if (Number(formData.bathrooms) < 0) { // Bisa 0 jika tidak ada private bathroom
      toast.error('Bathrooms cannot be negative.');
      return;
    }


    setIsSubmitting(true);
    const toastId = toast.loading('Creating property...');

    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        toast.error("User not authenticated. Please log in again.", { id: toastId });
        setIsSubmitting(false);
        navigate('/login');
        return;
      }

      const userData = JSON.parse(storedUser);
      const ownerId = userData.id; // Pastikan 'id' adalah field yang benar

      if (!ownerId) {
        toast.error("User ID not found. Please log in again.", { id: toastId });
        setIsSubmitting(false);
        return;
      }

      // Kirim data properti (termasuk kolom baru)
      const propertyDetails = {
        title: formData.title,
        description: formData.description,
        price_per_night: Number(formData.price_per_night) || 0, // Default ke 0 jika kosong
        location: formData.location,
        category: formData.category,
        size: formData.size !== '' ? Number(formData.size) : null, // Kirim null jika kosong
        owner_id: ownerId,
        is_available: Boolean(formData.is_available),
        is_featured: Boolean(formData.is_featured),
        max_guests: Number(formData.max_guests),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
      };

      console.log('Property details payload:', propertyDetails);

      const propertyResponse = await axios.post(
        'http://localhost:3000/api/properties', // Sesuaikan URL API Anda
        propertyDetails,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!propertyResponse.data.success) {
        throw new Error(propertyResponse.data.message || 'Failed to add property details');
      }

      const propertyId = propertyResponse.data.data.id;
      toast.success('Property details saved!', { id: toastId });


      // Create facilities
      const activeFacilities = facilities.filter(f => f.available);
      if (activeFacilities.length > 0) {
        toast.loading('Adding facilities...', { id: toastId });
        for (const facility of activeFacilities) {
          try {
            const facilityData = { property_id: propertyId, name: facility.name, condition: facility.condition };
            await axios.post('http://localhost:3000/api/facilities', facilityData, { // Sesuaikan URL API
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            });
          } catch (facilityError) {
            console.error(`Error creating facility ${facility.name}:`, facilityError.response?.data || facilityError.message);
            toast.error(`Failed to add facility: ${facility.name}. Continuing...`, { duration: 4000 });
          }
        }
      }

      // Upload gambar
      if (imageFiles.length > 0) {
        toast.loading('Uploading images...', { id: toastId });
        const mainImageFile = imageFiles[images.findIndex(img => img.isMain)];
        const otherImageFiles = imageFiles.filter(file => file !== mainImageFile);

        // Upload main/thumbnail image first
        if (mainImageFile) {
          const thumbnailFormData = new FormData();
          thumbnailFormData.append('property_id', propertyId);
          thumbnailFormData.append('image', mainImageFile); // Endpoint tunggal mungkin 'image'
          thumbnailFormData.append('is_thumbnail', 'true');
          try {
            await axios.post('http://localhost:3000/api/images/upload', thumbnailFormData, { // Sesuaikan URL API
              headers: { Authorization: `Bearer ${token}` } // Content-Type dihandle Axios
            });
          } catch (thumbErr) {
            console.error("Error uploading thumbnail:", thumbErr.response?.data || thumbErr.message);
            toast.error("Failed to upload main image. Continuing...", { duration: 4000 });
          }
        }

        // Upload other images
        if (otherImageFiles.length > 0) {
          const multipleImagesFormData = new FormData();
          multipleImagesFormData.append('property_id', propertyId);
          otherImageFiles.forEach(file => {
            multipleImagesFormData.append('images', file); // Endpoint multiple mungkin 'images'
          });
          try {
            const imageUploadResponse = await axios.post('http://localhost:3000/api/images/upload/multiple', multipleImagesFormData, { // Sesuaikan URL API
              headers: { Authorization: `Bearer ${token}` }
            });
            if (imageUploadResponse.data.success) {
              const count = imageUploadResponse.data.data?.successful_uploads || otherImageFiles.length;
              toast.success(`${count} additional image(s) uploaded.`, { duration: 3000 });
            } else {
              toast.warn(imageUploadResponse.data.message || "Some additional images might not have uploaded.", { duration: 4000 });
            }
          } catch (imageError) {
            console.error("Error uploading multiple images:", imageError.response?.data || imageError.message);
            toast.error("Failed to upload some additional images.", { duration: 4000 });
          }
        }
      }

      toast.success('Property created successfully!', { id: toastId, duration: 3000 });
      setTimeout(() => {
        navigate('/admin/properties'); // Arahkan ke daftar properti admin
      }, 1500);

    } catch (error) {
      console.error('Error adding property:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to add property. Check console.', { id: toastId });
    } finally {
      setIsSubmitting(false);
      // toast.dismiss(toastId); // Hapus loading toast jika masih ada, tapi toast.success/error seharusnya sudah menggantinya
    }
  };


  const handleFacilityChange = (index, field, value) => {
    const updatedFacilities = [...facilities];
    updatedFacilities[index][field] = value;
    // Jika facility tidak available, set condition ke default (misalnya, yang pertama di options)
    // atau biarkan user yang set jika perlu (misal: 'rusak' meski tidak available)
    if (field === 'available' && value === false) {
      updatedFacilities[index].condition = conditionOptions[0]; // Opsional: reset condition
    }
    setFacilities(updatedFacilities);
  };

  const handleNewFacilityChange = (field, value) => {
    setNewFacility(prev => ({
      ...prev,
      [field]: value,
      // Jika tidak available, condition bisa di-disable di UI atau di-set ke default
      // condition: field === 'available' && !value ? conditionOptions[0] : prev.condition
    }));
  };

  const addFacility = () => {
    if (!newFacility.name.trim()) {
      toast.error('Facility name is required');
      return;
    }
    if (facilities.some(f => f.name.toLowerCase() === newFacility.name.toLowerCase())) {
      toast.error(`Facility "${newFacility.name}" already exists.`);
      return;
    }
    setFacilities([...facilities, { ...newFacility }]); // Salin newFacility
    setNewFacility({ name: '', available: true, condition: conditionOptions[0] }); // Reset form tambah fasilitas
    setIsAddingFacility(false);
  };

  const removeFacility = (index) => {
    setFacilities(prev => prev.filter((_, i) => i !== index));
  };

  // Cleanup Object URLs
  useEffect(() => {
    return () => {
      images.forEach(image => URL.revokeObjectURL(image.preview));
    };
  }, [images]);


  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Add New Property</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 sm:p-8 space-y-8">
          {/* Section 1: Basic Details */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Property Title <span className="text-red-500">*</span></label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black" placeholder="e.g., Luxurious Villa with Ocean View" />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
                <input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black " placeholder="e.g., Seminyak, Bali" />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black " placeholder="Detailed description of the property..."></textarea>
            </div>
          </section>

          {/* Section 2: Pricing & Category */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Pricing & Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price_per_night" className="block text-sm font-medium text-gray-700 mb-1">Price per Night (IDR) <span className="text-red-500">*</span></label>
                <input type="number" id="price_per_night" name="price_per_night" value={formData.price_per_night} onChange={handleInputChange} min="0" step="1000" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black" placeholder="1000000" />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select id="category" name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black">
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="kost">Kost</option>
                  <option value="cottage">Cottage</option>
                  <option value="guest_house">Guest House</option>

                  {/* Tambahkan kategori lain jika perlu */}
                </select>
              </div>
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">Size (sqm)</label>
                <input type="number" id="size" name="size" value={formData.size} onChange={handleInputChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black" placeholder="120" />
              </div>
            </div>

            {/* --- INPUT UNTUK MAX_GUESTS, BEDROOMS, BATHROOMS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div>
                <label htmlFor="max_guests" className="block text-sm font-medium text-gray-700 mb-1">Max Guests</label>
                <input
                  type="number"
                  id="max_guests"
                  name="max_guests"
                  value={formData.max_guests}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black"
                />
              </div>
              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black"
                />
              </div>
              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Status & Features */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Status & Features</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <input type="checkbox" id="is_available" name="is_available" checked={formData.is_available} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">Available for booking</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="is_featured" name="is_featured" checked={formData.is_featured} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">Featured property (display prominently)</label>
              </div>
            </div>
          </section>


          {/* Section 4: Images */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Property Images</h2>
            <div className="mb-2">
              <label htmlFor="image-upload" className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
                <FiUpload className="mr-2 h-5 w-5" />
                Upload Images
              </label>
              <input type="file" id="image-upload" className="hidden" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageUpload} />
              <p className="mt-1 text-xs text-gray-500">Max 10 images. PNG, JPG, WEBP up to 5MB each. Click image to set as main.</p>
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div key={index} className={`relative rounded-lg overflow-hidden border-2 cursor-pointer hover:opacity-80 transition-opacity ${image.isMain ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-200'}`} onClick={() => setMainImage(index)}>
                    <img src={image.preview} alt={`Preview ${index + 1}`} className="h-32 w-full object-cover" />
                    {image.isMain && (
                      <div className="absolute top-1 left-1 bg-indigo-600 text-white px-2 py-0.5 rounded-md text-xs font-semibold">Main</div>
                    )}
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(index); }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 shadow-md hover:bg-red-700 leading-none">
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex justify-center items-center border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div>
                  <FiUpload className="mx-auto h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">No images uploaded yet.</p>
                  <p className="text-xs text-gray-500">Click "Upload Images" to add.</p>
                </div>
              </div>
            )}
          </section>

          {/* Section 5: Facilities */}
          <section>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-semibold text-gray-700">Facilities</h2>
              {!isAddingFacility && (
                <button type="button" onClick={() => setIsAddingFacility(true)} className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <FiPlus className="mr-2 h-4 w-4" /> Add Facility
                </button>
              )}
            </div>

            {isAddingFacility && (
              <div className="mb-6 p-4 border border-indigo-200 bg-indigo-50 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-medium text-indigo-700">Add New Facility</h3>
                  <button type="button" onClick={() => setIsAddingFacility(false)} className="text-gray-500 hover:text-gray-700"><FiX size={18} /></button>
                </div>
                <input type="text" value={newFacility.name} onChange={(e) => handleNewFacilityChange('name', e.target.value)} placeholder="Facility Name (e.g., Swimming Pool)" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                <div className="grid grid-cols-2 gap-4 items-center">
                  <label className="flex items-center text-sm">
                    <input type="checkbox" checked={newFacility.available} onChange={(e) => handleNewFacilityChange('available', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2" />
                    Available
                  </label>
                  <select value={newFacility.condition} onChange={(e) => handleNewFacilityChange('condition', e.target.value)} disabled={!newFacility.available} className={`w-full px-3 py-2 text-sm border border-gray-300 bg-white  rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${!newFacility.available ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                    {conditionOptions.map(option => <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>)}
                  </select>
                </div>
                <button type="button" onClick={addFacility} className="w-full mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <FiPlus className="inline-block mr-1" /> Add This Facility
                </button>
              </div>
            )}

            {facilities.length > 0 ? (
              <div className="space-y-3">
                {facilities.map((facility, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded-md shadow-sm">
                    <span className="text-sm font-medium text-gray-800 flex-1">{facility.name}</span>
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <label className="flex items-center text-sm text-black">
                        <input type="checkbox" checked={facility.available} onChange={(e) => handleFacilityChange(index, 'available', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-1.5" />
                        Avail.
                      </label>
                      <select value={facility.condition} onChange={(e) => handleFacilityChange(index, 'condition', e.target.value)} disabled={!facility.available} className={`px-2 py-1 text-xs border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${!facility.available ? 'bg-gray-200 cursor-not-allowed text-gray-500' : 'text-black'}`}>
                        {conditionOptions.map(option => <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>)}
                      </select>
                      <button type="button" onClick={() => removeFacility(index)} className="text-red-500 hover:text-red-700 p-1">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !isAddingFacility && <p className="text-sm text-gray-500 text-center py-4">No facilities added yet. Click "Add Facility" to add some.</p>
            )}
          </section>


          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-gray-500 mb-4 sm:mb-0"><span className="text-red-500">*</span> Indicates a required field.</p>
            <div className="flex space-x-3">
              <button type="button" onClick={() => navigate('/admin/properties')} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2 h-4 w-4" />
                    Create Property
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddProperty;