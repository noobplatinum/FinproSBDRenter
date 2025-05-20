import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAvailableProperties, getPropertyThumbnail } from '../services/property.service';
import { FiSearch, FiStar, FiDollarSign, FiShield, FiArrowRight, FiMapPin, FiHome, FiCalendar } from 'react-icons/fi';
import { FaHotel, FaHome, FaBuilding, FaWarehouse, FaChevronDown } from 'react-icons/fa';
import RenterInLogo from '../assets/RenterIn-logo.png';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [thumbnails, setThumbnails] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isScrolled, setIsScrolled] = useState(false);
  const featuredSectionRef = useRef(null);

  // Hero image collection for carousel
  const heroImages = [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80'
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await getAvailableProperties();
        if (response.success) {
          setProperties(response.data);

          // Fetch thumbnails for each property
          const thumbnailPromises = response.data.map(async (property) => {
            const thumbnailResponse = await getPropertyThumbnail(property.id);
            if (thumbnailResponse.success && thumbnailResponse.data) {
              return { id: property.id, url: thumbnailResponse.data.url };
            }
            return null;
          });

          const thumbnailResults = await Promise.all(thumbnailPromises);
          const thumbnailMap = {};

          thumbnailResults.forEach(result => {
            if (result) {
              thumbnailMap[result.id] = result.url;
            }
          });

          setThumbnails(thumbnailMap);
        }
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const scrollToFeatured = () => {
    featuredSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const categories = [
    { id: 'all', name: 'Semua', icon: <FaHome className="w-5 h-5" /> },
    { id: 'apartment', name: 'Apartemen', icon: <FaBuilding className="w-5 h-5" /> },
    { id: 'house', name: 'Rumah', icon: <FaHome className="w-5 h-5" /> },
    { id: 'villa', name: 'Villa', icon: <FaHotel className="w-5 h-5" /> },
    { id: 'kost', name: 'Kost', icon: <FaWarehouse className="w-5 h-5" /> }
  ];

  const filteredProperties = properties.filter(property => {
    const matchesCategory = selectedCategory === 'all' || property.category?.toLowerCase() === selectedCategory;
    const matchesSearch = property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full overflow-x-hidden bg-white">
      {/* Hero Section with Carousel and Gradient Overlay */}
      <section
        className="relative w-full h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Image carousel with animation */}
        {heroImages.map((image, index) => (
          <motion.div
            key={index}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{
              opacity: index === currentImageIndex ? 1 : 0,
              scale: index === currentImageIndex ? 1 : 1.1
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        ))}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10"></div>

        {/* Content */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 text-center z-20 relative">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 flex justify-center"
          >
            <img
              src={RenterInLogo}
              alt="RenterIn Logo"
              className="h-24 w-auto object-contain mb-4"
            />
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
          >
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Cara Mudah Sewa Properti
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-100 mb-12 max-w-3xl mx-auto"
          >
            Sewa properti kualitas terbaik dengan harga terjangkau di seluruh Indonesia
          </motion.p>

          {/* Enhanced Search Box with Animation */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-4xl mx-auto w-full"
          >
            <div className="flex flex-col md:flex-row bg-white/95 backdrop-blur-lg p-3 md:p-4 rounded-2xl shadow-2xl">
              <div className="flex-grow flex items-center border-b md:border-b-0 md:border-r border-gray-200 pb-3 md:pb-0 md:pr-3 mb-3 md:mb-0">
                <FiMapPin className="h-6 w-6 text-blue-600 mx-3 flex-shrink-0" />
                <input
                  type="text"
                  className="flex-grow px-3 py-3 md:py-4 text-gray-700 focus:outline-none text-lg bg-transparent"
                  placeholder="Cari lokasi atau nama properti..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <button className="bg-blue-600 hover:bg-blue-700 px-8 md:px-10 py-4 text-white rounded-xl flex items-center transition-all duration-300 shadow-lg hover:shadow-xl mx-auto md:mx-4 w-full md:w-auto justify-center transform hover:scale-105">
                  <FiSearch className="h-5 w-5 mr-2" />
                  <span className="text-lg font-medium">Cari</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scroll to top button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: isScrolled ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50 transform hover:scale-110 transition-transform`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>

      {/* Category Filters - Redesigned */}
      <section ref={featuredSectionRef} className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between mb-10"
          >
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Jelajahi <span className="text-blue-600">Properti</span></h2>
              <p className="text-gray-600">Pilih kategori untuk menemukan properti impian Anda</p>
            </div>
            <Link to="/properties" className="group flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors">
              <span>Lihat Semua Properti</span>
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex overflow-x-auto gap-4 pb-6 hide-scrollbar"
          >
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className={`flex-shrink-0 flex items-center justify-center px-8 py-4 rounded-xl ${selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  } transition-all duration-300 transform hover:-translate-y-1`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="flex items-center text-lg">
                  {category.icon}
                  <span className="ml-2 font-medium">{category.name}</span>
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Property Listings - Full Bleed with Container */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white w-full">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group"
                >
                  <Link to={`/properties/${property.id}`}>
                    <div className="h-56 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <img
                        src={thumbnails[property.id] || 'https://placehold.co/300x200?text=No+Image'}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-3 left-3 z-20">
                        <span className="text-sm font-medium px-3 py-1 bg-blue-600 text-white rounded-full shadow-lg">
                          {property.category || 'Properti'}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center text-yellow-500">
                          <FiStar className="h-5 w-5 fill-current" />
                          <span className="text-sm ml-1 font-medium">
                            {property.rating_avg || '0'} <span className="text-gray-400">({property.rating_count || '0'} ulasan)</span>
                          </span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {property.title}
                      </h3>
                      <p className="flex items-center text-gray-600 mb-4">
                        <FiMapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{property.location}</span>
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <p className="text-blue-600 font-bold text-lg">
                          Rp {new Intl.NumberFormat('id-ID').format(property.price_per_night)}
                        </p>
                        <span className="text-sm text-gray-500">/malam</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500 text-xl">Tidak ada properti yang ditemukan.</p>
            </div>
          )}
        </div>
      </section>

      {/* Keunggulan RenterIn - Interactive Features Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full"></div>
          <div className="absolute top-1/2 -right-20 w-60 h-60 bg-purple-500 rounded-full"></div>
          <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-cyan-500 rounded-full"></div>

          <div className="absolute w-full h-full">
            <div className="w-full h-full" style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23bae6fd\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
              backgroundSize: '30px 30px'
            }}></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <span className="text-sm font-semibold px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 inline-block mb-4">
              KEUNGGULAN KAMI
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Fitur Unggulan RenterIn
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Platform pencarian properti modern yang dirancang untuk memberikan pengalaman terbaik dalam menemukan hunian impian Anda
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                ),
                title: "Pencarian Cerdas",
                description: "Algoritma pencarian canggih yang memahami preferensi Anda dan menampilkan properti yang paling sesuai dengan kebutuhan.",
                bgGradient: "from-blue-500 to-blue-600",
                hoverGradient: "from-blue-600 to-blue-700"
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                ),
                title: "Pembayaran Aman",
                description: "Transaksi terjamin dengan sistem pembayaran terenkripsi dan perlindungan penuh untuk setiap reservasi Anda.",
                bgGradient: "from-indigo-500 to-indigo-600",
                hoverGradient: "from-indigo-600 to-indigo-700"
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                ),
                title: "Booking Instan",
                description: "Proses pemesanan cepat tanpa menunggu. Konfirmasi langsung dan e-tiket otomatis untuk kenyamanan Anda.",
                bgGradient: "from-cyan-500 to-cyan-600",
                hoverGradient: "from-cyan-600 to-cyan-700"
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                  </svg>
                ),
                title: "Filter Canggih",
                description: "Tentukan pencarian Anda dengan filter detail seperti fasilitas, range harga, lokasi spesifik, dan banyak lagi.",
                bgGradient: "from-purple-500 to-purple-600",
                hoverGradient: "from-purple-600 to-purple-700"
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                  </svg>
                ),
                title: "Ulasan Transparan",
                description: "Ulasan asli dari pengguna sebelumnya membantu Anda membuat keputusan dengan lebih percaya diri.",
                bgGradient: "from-green-500 to-green-600",
                hoverGradient: "from-green-600 to-green-700"
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path>
                  </svg>
                ),
                title: "Product Marketing",
                description: "Sebarkan tawaran anda ke ratusan pengguna setia RenterIn.",
                bgGradient: "from-rose-500 to-rose-600",
                hoverGradient: "from-rose-600 to-rose-700"
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.hoverGradient} transform rotate-3 scale-x-105 scale-y-105 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className={`relative h-full bg-gradient-to-r ${feature.bgGradient} rounded-2xl p-8 overflow-hidden transform group-hover:-translate-y-2 transition-transform duration-300 shadow-lg group-hover:shadow-xl`}>
                  <div className="absolute right-0 top-0 w-32 h-32 -mt-10 -mr-10 rounded-full bg-white opacity-10"></div>

                  <div className="relative z-10 mb-8 w-16 h-16 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    {feature.icon}
                  </div>

                  <h3 className="relative z-10 text-2xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="relative z-10 text-white/90 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tambahkan CTA di bagian bawah menggantikan tabel perbandingan */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <span>Mulai Gunakan RenterIn Sekarang</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="text-gray-600 mt-6">RenterIn adalah pilihan terbaik untuk menemukan hunian impian Anda</p>
          </motion.div>
        </div>
      </section>

      {/* Promotion Section - Full Width with Animation */}
      <section className="py-24 px-4 w-full bg-gradient-to-r from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Mengapa Memilih <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">RenterIn</span>?
              </h2>
              <div className="space-y-8">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex items-start"
                >
                  <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                    <FiStar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-xl font-semibold mb-2">Kualitas Terjamin</h3>
                    <p className="text-gray-600 text-lg">Semua properti kami telah melalui verifikasi dan pemeriksaan kualitas untuk kenyamanan Anda.</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex items-start"
                >
                  <div className="flex-shrink-0 bg-green-100 p-3 rounded-full">
                    <FiDollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-xl font-semibold mb-2">Harga Transparan</h3>
                    <p className="text-gray-600 text-lg">Tidak ada biaya tersembunyi. Apa yang Anda lihat adalah apa yang Anda bayar.</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex items-start"
                >
                  <div className="flex-shrink-0 bg-purple-100 p-3 rounded-full">
                    <FiShield className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-xl font-semibold mb-2">Keamanan Terjaga</h3>
                    <p className="text-gray-600 text-lg">Keamanan transaksi dan data pribadi pengguna adalah prioritas utama kami.</p>
                  </div>
                </motion.div>
              </div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                viewport={{ once: true }}
                className="mt-10"
              >
                <Link
                  to="/about"
                  className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-flex items-center transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span className="text-lg font-medium">Pelajari Lebih Lanjut</span>
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="hidden md:block"
            >
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-full h-full bg-blue-600/10 rounded-2xl"></div>
                <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-blue-600/20 rounded-2xl"></div>
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80"
                  alt="Apartemen Nyaman"
                  className="rounded-2xl shadow-2xl w-full h-auto relative z-10"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-xl"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Siap Menemukan Hunian Impian Anda?
          </motion.h2>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto"
          >
            Daftarkan diri Anda sekarang dan dapatkan akses ke ribuan properti berkualitas dengan harga terbaik.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-medium text-lg inline-flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              Daftar Sekarang
            </Link>
            <Link
              to="/properties"
              className="px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-xl font-medium text-lg inline-flex items-center justify-center transition-all transform hover:-translate-y-1"
            >
              Jelajahi Properti
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
