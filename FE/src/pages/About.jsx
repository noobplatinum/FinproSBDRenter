import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHome, FiTarget, FiUsers, FiStar, FiShield, FiCheck } from 'react-icons/fi';
import RenterInLogo from '../assets/RenterIn-logo.png';

const About = () => {
  const [activeTab, setActiveTab] = useState('story');
  const [isScrolled, setIsScrolled] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Map tab indices to determine animation direction
  const tabOrder = { 'story': 0, 'mission': 1, 'team': 2 };

  const handleTabChange = (newTab) => {
    // Set animation direction based on current and new tab
    setDirection(tabOrder[newTab] > tabOrder[activeTab] ? 1 : -1);
    setActiveTab(newTab);
  };

  const tabs = [
    { id: 'story', label: 'Tentang Kami' },
    { id: 'mission', label: 'Visi & Misi' },
    { id: 'team', label: 'Kelompok 11' },
  ];

  const teamMembers = [
    { 
      name: 'Wilman', 
      image: '',
    },
    { 
      name: 'David', 
      image: '',
    },
    { 
      name: 'Daffa', 
      image: '',
    },
    { 
      name: 'Dzaky', 
      image: '',
    },
  ];

  const pageTransition = {
    initial: (direction) => ({
      opacity: 0,
      x: direction * 100
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction * -100,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    })
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const fadeUpItem = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        y: { type: "spring", stiffness: 100 },
        opacity: { duration: 0.5 }
      }
    }
  };

  const renderStory = () => (
    <motion.div 
      custom={direction}
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-12"
    >
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
      >
        <motion.div variants={fadeUpItem}>
          <h3 className="text-3xl font-bold text-gray-800 mb-6 relative">
            RenterIn
            <div className="absolute -bottom-2 left-0 w-16 h-1 bg-blue-600"></div>
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            RenterIn adalah platform pencarian properti modern yang didirikan pada tahun 2025 dengan tujuan memudahkan proses pencarian hunian. Kami menghubungkan para pencari properti dengan pemilik properti terpercaya melalui sistem yang transparan dan aman.
          </p>
        </motion.div>
        <motion.div variants={fadeUpItem} className="relative">
          <div className="absolute -top-4 -left-4 w-full h-full bg-blue-600/10 rounded-2xl"></div>
          <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-blue-600/20 rounded-2xl"></div>
          <img 
            src="https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
            alt="RenterIn Journey" 
            className="rounded-2xl shadow-2xl w-full h-auto relative z-10 object-cover"
          />
        </motion.div>
      </motion.div>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {[
          {
            icon: <FiStar className="h-8 w-8" />,
            title: "Kualitas Terjamin",
            description: "Semua properti telah melalui proses verifikasi untuk memastikan kenyamanan Anda"
          },
          {
            icon: <FiShield className="h-8 w-8" />,
            title: "Transaksi Aman",
            description: "Sistem pembayaran terenkripsi dan perlindungan penuh untuk setiap transaksi"
          },
          {
            icon: <FiUsers className="h-8 w-8" />,
            title: "Ulasan Pengguna",
            description: "Lihat ulasan asli dari pengguna lain untuk membantu keputusan Anda"
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            variants={fadeUpItem}
            whileHover={{ 
              y: -10, 
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)"
            }}
            transition={{ type: "spring", stiffness: 400 }}
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
              {feature.icon}
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h4>
            <p className="text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );

  const renderMission = () => (
    <motion.div 
      custom={direction}
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-12"
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.6, ease: "easeOut" }
        }}
        className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-10 rounded-2xl shadow-lg relative overflow-hidden"
      >
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-20 -mb-20"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative z-10"
        >
          <div className="flex items-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.3 
              }}
            >
              <FiTarget className="w-10 h-10 mr-4" />
            </motion.div>
            <h3 className="text-3xl font-bold">Visi Kami</h3>
          </div>
          <p className="text-lg leading-relaxed mb-8">
            Menjadi platform penyewaan properti terdepan di Indonesia yang mengubah cara orang menemukan dan menyewa tempat tinggal, memberikan akses hunian berkualitas untuk semua kalangan.
          </p>
          
          <div className="flex items-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.5 
              }}
            >
              <FiCheck className="w-10 h-10 mr-4" />
            </motion.div>
            <h3 className="text-3xl font-bold">Misi Kami</h3>
          </div>
          <ul className="space-y-3">
            {[
              'Menyediakan platform pencarian hunian yang intuitif dan mudah digunakan',
              'Memastikan transparansi informasi properti untuk keputusan yang tepat',
              'Menghubungkan penyewa dengan pemilik properti terpercaya',
              'Menyediakan sistem pembayaran yang aman dan terpercaya',
              'Memberikan dukungan pelanggan 24/7 untuk kenyamanan pengguna'
            ].map((point, i) => (
              <motion.li 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (i * 0.1) }}
                key={i} 
                className="flex items-start"
              >
                <motion.span 
                  className="text-blue-200 mr-3"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + (i * 0.1) }}
                >•</motion.span>
                <span>{point}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          {title: "50+", text: "Kota di Indonesia" },
          {title: "10,000+", text: "Properti Terdaftar" },
          {title: "100%", text: "Terverifikasi" },
          {title: "24/7", text: "Dukungan" },
        ].map((item, index) => (
          <motion.div
            key={index}
            variants={fadeUpItem}
            whileHover={{ 
              y: -5, 
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)"
            }}
            className="bg-white p-6 rounded-xl shadow-md text-center overflow-hidden relative"
          >
            <motion.div 
              className="absolute inset-0 bg-blue-50 opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 + (index * 0.1) }}
              className="text-4xl mb-3 relative z-10"
            >
              {item.icon}
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + (index * 0.1), duration: 0.5 }}
              className="relative z-10"
            >
              <h4 className="text-2xl font-bold text-gray-800 mb-1">{item.title}</h4>
              <p className="text-gray-600">{item.text}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );

  const renderTeam = () => (
    <motion.div 
      custom={direction}
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-12"
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto"
      >
        <h3 className="text-3xl font-bold text-gray-800 mb-4">Tim RenterIn</h3>
        <p className="text-lg text-gray-600">
          Kami berdedikasi untuk mengubah cara menemukan hunian, dengan menggabungkan teknologi dan pemahaman akan kebutuhan pengguna.
        </p>
      </motion.div>
      
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            variants={fadeUpItem}
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="bg-white rounded-xl shadow-md overflow-hidden group"
          >
            <div className="h-64 overflow-hidden relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent opacity-0 z-10"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.img 
                src={member.image} 
                alt={member.name} 
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <motion.div 
              className="p-6 text-center"
              whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.6)" }}
              transition={{ duration: 0.2 }}
            >
              <h4 className="text-xl font-bold text-gray-800">{member.name}</h4>
              <p className="text-blue-600">{member.role}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-center"
      >
        <Link 
          to="/contact" 
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-xl transition-all group"
        >
          <span>Hubungi Tim Kami</span>
          <motion.svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 ml-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            animate={{ x: [0, 5, 0] }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "loop", 
              duration: 1.5,
              repeatDelay: 0.5 
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </motion.svg>
        </Link>
      </motion.div>
    </motion.div>
  );

  const renderContent = () => {
    return (
      <AnimatePresence mode="wait" custom={direction}>
        {activeTab === 'mission' ? (
          <motion.div key="mission">
            {renderMission()}
          </motion.div>
        ) : activeTab === 'team' ? (
          <motion.div key="team">
            {renderTeam()}
          </motion.div>
        ) : (
          <motion.div key="story">
            {renderStory()}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
        <motion.div 
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div 
            className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-100 rounded-full opacity-20 blur-3xl"
            animate={{ 
              x: [0, 20, 0], 
              y: [0, -20, 0],
            }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "mirror", 
              duration: 20,
              ease: "easeInOut" 
            }}
          ></motion.div>
          <motion.div 
            className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-100 rounded-full opacity-20 blur-3xl"
            animate={{ 
              x: [0, -20, 0], 
              y: [0, 20, 0],
            }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "mirror", 
              duration: 15,
              ease: "easeInOut" 
            }}
          ></motion.div>
        </motion.div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 260, 
                damping: 20,
                duration: 0.8 
              }}
            >
              <img 
                src={RenterInLogo} 
                alt="RenterIn Logo" 
                className="h-16 w-auto mx-auto mb-6" 
              />
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Tentang RenterIn
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Platform properti modern yang dirancang dengan fokus pada pengalaman pengguna
            </motion.p>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`flex justify-center mb-12 sticky ${
              isScrolled 
                ? 'top-16 pt-4 pb-4 bg-white/90 backdrop-blur-sm shadow-md z-40 transition-all duration-300' 
                : 'top-0'
            }`}
          >
            <div className="flex gap-4 p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-6 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Content Section */}
      <section className="py-12 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </section>
      
      {/* Bottom CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <motion.div 
            className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-xl"
            animate={{ 
              x: [0, 30, 0], 
              y: [0, -30, 0],
            }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "mirror", 
              duration: 10,
              ease: "easeInOut" 
            }}
          ></motion.div>
          <motion.div 
            className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-xl"
            animate={{ 
              x: [0, -30, 0], 
              y: [0, 30, 0],
            }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "mirror", 
              duration: 15,
              ease: "easeInOut" 
            }}
          ></motion.div>
        </motion.div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2 
            className="text-3xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Mulai Cari Hunian Impian Anda Sekarang
          </motion.h2>
          
          <motion.p 
            className="text-lg text-blue-100 mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Bergabunglah dengan ribuan pengguna lain yang telah menemukan hunian ideal mereka melalui RenterIn
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/properties" 
                className="px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-lg shadow-md hover:shadow-xl transition-all inline-block"
              >
                Jelajahi Properti
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/register" 
                className="px-6 py-3 bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-lg font-medium text-lg transition-all inline-block"
              >
                Daftar Sekarang
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;