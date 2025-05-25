import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiMapPin, FiStar, FiSearch, FiFilter, FiChevronDown, FiHome, FiDollarSign, FiUsers } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import PropertyImages from '../components/PropertyImages';
import PropertyCard from '../components/PropertyCard';

const Properties = () => {
  const { id } = useParams(); // Ambil parameter ID dari URL
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [bedrooms, setBedrooms] = useState('any');
  const [thumbnails, setThumbnails] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [isScrolled, setIsScrolled] = useState(false);
  const filtersRef = useRef(null);
  
  // Kategori properti
  const categories = [
    { id: 'all', name: 'Semua', icon: <FiHome className="mr-2" /> },
    { id: 'apartment', name: 'Apartemen', icon: <FiHome className="mr-2" /> },
    { id: 'house', name: 'Rumah', icon: <FiHome className="mr-2" /> },
    { id: 'villa', name: 'Villa', icon: <FiHome className="mr-2" /> },
    { id: 'kost', name: 'Kost', icon: <FiHome className="mr-2" /> }
  ];

  // Format harga ke rupiah
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Format rating untuk menghindari error toFixed
  const formatRating = (rating) => {
    // Pastikan rating numerik dan valid sebelum menggunakan toFixed
    if (typeof rating === 'number') {
      return rating.toFixed(1);
    }
    return '0.0';
  };

  useEffect(() => {
    if (id) {
      const fetchPropertyDetail = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`https://finpro-sbd-renter-backend.vercel.app/api/properties/${id}`);
          
          if (response.data.success) {
            let propertyData = response.data.data;
            if (propertyData.rating_avg && typeof propertyData.rating_avg !== 'number') {
              propertyData.rating_avg = parseFloat(propertyData.rating_avg) || 0;
            }
            
            setProperty(propertyData);
            
            try {
              const thumbnailResponse = await axios.get(`https://finpro-sbd-renter-backend.vercel.app/api/images/property/${id}/thumbnail`);
              if (thumbnailResponse.data.success && thumbnailResponse.data.data) {
                setThumbnails({
                  [id]: thumbnailResponse.data.data.url
                });
              }
            } catch (thumbnailErr) {
              console.log(`Thumbnail tidak tersedia untuk properti ${id}, menggunakan placeholder`);
            }
          } else {
            setError('Gagal mengambil detail properti');
          }
        } catch (error) {
          console.error('Error fetching property detail:', error);
          setError('Terjadi kesalahan saat memuat detail properti');
        } finally {
          setLoading(false);
        }
      };
      
      fetchPropertyDetail();
    } else {
      const fetchProperties = async () => {
        try {
          setLoading(true);
          const response = await axios.get('https://finpro-sbd-renter-backend.vercel.app/api/properties');
          
          if (response.data.success) {
            const propertiesWithValidRatings = response.data.data.map(prop => {
              if (prop.rating_avg && typeof prop.rating_avg !== 'number') {
                return {...prop, rating_avg: parseFloat(prop.rating_avg) || 0};
              }
              return prop;
            });

            setProperties(propertiesWithValidRatings);
            
            const thumbnailMap = {};
            
            await Promise.allSettled(
              propertiesWithValidRatings.map(async (property) => {
                try {
                  const imageResponse = await axios.get(`https://finpro-sbd-renter-backend.vercel.app/api/images/property/${property.id}/thumbnail`);
                  if (imageResponse.data.success && imageResponse.data.data) {
                    thumbnailMap[property.id] = imageResponse.data.data.url;
                  }
                } catch (err) {
                  console.log(`Thumbnail tidak tersedia untuk properti ${property.id}, menggunakan placeholder`);
                  // Tidak perlu throw error lagi, cukup log saja
                }
              })
            );
            
            setThumbnails(thumbnailMap);
          } else {
            setError('Gagal mengambil data properti');
          }
        } catch (error) {
          console.error('Error fetching properties:', error);
          setError('Terjadi kesalahan saat memuat properti');
        } finally {
          setLoading(false);
        }
      };
      
      fetchProperties();
    }

    // Tambahkan event listener untuk scroll
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      if (scrollTop > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]); // Tambahkan id sebagai dependency

  // Effect untuk menutup filter saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target) && !event.target.closest('.filter-button')) {
        setShowFilters(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter dan sort properti
  const filteredProperties = properties
    .filter(property => {
      const matchesCategory = selectedCategory === 'all' || 
                            property.category?.toLowerCase() === selectedCategory;
      const matchesSearch = !searchTerm || 
                          property.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          property.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = property.price_per_night >= priceRange[0] && 
                          property.price_per_night <= priceRange[1];
      const matchesBedrooms = bedrooms === 'any' || 
                            property.bedrooms === parseInt(bedrooms);
                            
      return matchesCategory && matchesSearch && matchesPrice && matchesBedrooms;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price_per_night - b.price_per_night;
        case 'price_high':
          return b.price_per_night - a.price_per_night;
        case 'rating':
          return (b.rating_avg || 0) - (a.rating_avg || 0);
        case 'newest':
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });

  // Reset filter
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange([0, 10000000]);
    setBedrooms('any');
    setSortBy('newest');
    setShowFilters(false);
  };

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.4 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const propertyItem = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100,
        duration: 0.4 
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="relative w-24 h-24">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-6 text-xl font-medium text-gray-700">Memuat properti...</p>
        <p className="mt-2 text-gray-500">Mohon tunggu sebentar</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Tambahkan rendering khusus untuk detail properti jika ada ID
  if (id && property) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="mb-4">
              <Link 
                to="/properties"
                className="inline-flex items-center text-blue-600 hover:text-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Kembali ke Daftar Properti
              </Link>
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">{property.title}</h1>
              <p className="text-gray-600 flex items-center mt-2">
                <FiMapPin className="mr-2" /> 
                {property.location}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                {/* Ganti tampilan image statis dengan komponen PropertyImages */}
                <div className="mb-4 rounded-lg overflow-hidden">
                  <PropertyImages propertyId={property.id} />
                </div>
                
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 font-medium">Harga per malam</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(property.price_per_night)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 font-medium">Rating</span>
                    <div className="flex items-center">
                      <FiStar className="text-amber-400 mr-1" />
                      <span>{formatRating(property.rating_avg)} ({property.comment || '0'} ulasan)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Informasi Properti</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <FiHome className="mr-2 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Kategori</p>
                      <p className="font-medium">{property.category || 'Properti'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiUsers className="mr-2 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Maks. Tamu</p>
                      <p className="font-medium">{property.max_guests || 0} orang</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Kamar</p>
                      <p className="font-medium">{property.bedrooms || 0} kamar</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Kamar Mandi</p>
                      <p className="font-medium">{property.bathrooms || 0} kamar mandi</p>
                    </div>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-3 text-gray-800">Deskripsi</h2>
                <p className="text-gray-600 mb-6">{property.description || 'Tidak ada deskripsi'}</p>
                
                <div className="mt-4">
                  <Link 
                    to={`/booking/${property.id}`} 
                    className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg font-medium transition-colors shadow-md"
                  >
                    Pesan Sekarang
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rendering normal untuk daftar properti
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-80 sm:h-96 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-20"></div>
          <div className="absolute -bottom-20 right-10 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-20"></div>
        </div>

        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        <div className="relative h-full px-4 flex flex-col justify-center items-center text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Temukan Hunian Impian Anda
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-white max-w-2xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Jelajahi berbagai pilihan properti berkualitas dan temukan yang sesuai dengan kebutuhan Anda
          </motion.p>
          
          <motion.div 
            className="w-full max-w-4xl flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex-grow relative">
              <FiSearch className="absolute left-4 top-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cari berdasarkan lokasi atau nama properti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
              />
            </div>
            <button 
              className="filter-button h-12 px-6 bg-white text-blue-600 rounded-lg shadow-lg hover:bg-blue-50 flex items-center justify-center font-medium transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter className="mr-2" />
              Filter
            </button>
          </motion.div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Pills */}
        <motion.div 
          className="mb-8 overflow-x-auto flex gap-3 pb-2 hide-scrollbar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full flex items-center transition-all duration-300 ${
                selectedCategory === category.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category.icon}
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Advanced Filters Dropdown */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              ref={filtersRef}
              className="mb-8 bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harga per Malam</label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {formatCurrency(priceRange[0])}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(priceRange[1])}
                    </span>
                  </div>
                  <div className="mt-2">
                    <input
                      type="range"
                      min="0"
                      max="10000000"
                      step="100000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Kamar</label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="any">Semua</option>
                    <option value="1">1 Kamar</option>
                    <option value="2">2 Kamar</option>
                    <option value="3">3 Kamar</option>
                    <option value="4">4+ Kamar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urutan</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="price_low">Harga: Rendah ke Tinggi</option>
                    <option value="price_high">Harga: Tinggi ke Rendah</option>
                    <option value="rating">Rating Tertinggi</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Reset Filter
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="ml-4 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg text-sm font-medium"
                >
                  Terapkan Filter
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count and Sort dropdown on smaller screens */}
        <div className="flex flex-wrap justify-between items-center mb-8">
          <motion.p 
            className="text-xl font-bold text-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {filteredProperties.length} Properti Ditemukan
          </motion.p>
          
          <motion.div 
            className="flex items-center sm:hidden mt-4 sm:mt-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <span className="text-gray-600 mr-2">Urut:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="newest">Terbaru</option>
              <option value="price_low">Harga: Rendah ke Tinggi</option>
              <option value="price_high">Harga: Tinggi ke Rendah</option>
              <option value="rating">Rating Tertinggi</option>
            </select>
          </motion.div>
        </div>

        {/* Property Grid */}
        {filteredProperties.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProperties.map((property) => (
              <motion.div
                key={property.id}
                variants={propertyItem}
                whileHover={{ y: -8 }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-16 bg-white rounded-xl shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="h-40 w-40 mx-auto mb-6 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Tidak Ada Properti Ditemukan</h3>
            <p className="text-gray-500 mb-6">Kami tidak dapat menemukan properti yang sesuai dengan filter Anda.</p>
            <button 
              onClick={handleResetFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg font-medium"
            >
              Reset Filter
            </button>
          </motion.div>
        )}
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {isScrolled && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <FiChevronDown className="transform rotate-180" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Properties;