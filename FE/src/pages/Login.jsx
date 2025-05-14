import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
// Import logo
import RenterInLogo from '../assets/RenterIn-logo.png'; // Pastikan path ke logo benar

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect ke halaman sebelumnya atau home setelah login
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // Trigger entrance animation once component mounts
    setTimeout(() => {
      setAnimationComplete(true);
    }, 1000);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email dan password diperlukan');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      
      // Animate success before navigation
      toast.success('Login berhasil!', {
        icon: '🎉',
        style: {
          borderRadius: '10px',
          background: '#22c55e',
          color: '#fff',
        },
      });
      
      // Slight delay for better UX
      setTimeout(() => navigate(from, { replace: true }), 800);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login gagal, silakan coba lagi', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Interactive background elements */}
      <div className="absolute inset-0 z-0 opacity-50">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Left: Image with overlay content */}
      <motion.div 
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-indigo-900/90"></div>
        </div>
        
        {/* Content overlay on the image */}
        <div className="absolute inset-0 flex flex-col justify-center px-12 text-white z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mb-8 flex items-center"
          >
            <img 
              src={RenterInLogo} 
              alt="RenterIn Logo" 
              className="h-24 w-auto object-contain mr-4" 
            />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-5xl font-bold mb-4 text-white"
          >
            RenterIn
          </motion.h1>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="text-3xl font-bold mb-6 text-white"
          >
            Temukan Hunian Impian Anda
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="text-lg text-gray-100 mb-10"
          >
            Akses ke ribuan properti berkualitas untuk disewa di seluruh Indonesia. 
            Pengalaman menyewa yang aman, cepat, dan nyaman.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="space-y-5"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white text-lg">Lebih dari 10.000 properti tersedia</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white text-lg">Sistem pembayaran yang aman</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white text-lg">Dukungan pelanggan 24/7</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Right: Login Form */}
      <motion.div 
        initial={{ x: 200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 z-10"
      >
        <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-lg p-8 rounded-xl shadow-xl">
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="flex justify-center lg:hidden mb-6"
            >
              <img 
                src={RenterInLogo} 
                alt="RenterIn Logo" 
                className="h-24 w-auto object-contain" 
              />
            </motion.div>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent"
            >
              Selamat Datang Kembali!
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-3 text-sm text-gray-600"
            >
              Masukkan kredensial Anda untuk mengakses akun
            </motion.p>
          </div>
          
          <motion.form 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 space-y-6" 
            onSubmit={handleSubmit}
          >
            <div className="space-y-5">
              <div 
                className={`relative transition-all duration-300 ${
                  activeField === 'email' ? 'transform -translate-y-1' : ''
                }`}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className={`h-5 w-5 transition-colors ${
                    activeField === 'email' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-3.5 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:z-10 text-base transition-all duration-300"
                  placeholder="Alamat Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField(null)}
                />
              </div>
              
              <div 
                className={`relative transition-all duration-300 ${
                  activeField === 'password' ? 'transform -translate-y-1' : ''
                }`}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className={`h-5 w-5 transition-colors ${
                    activeField === 'password' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-3.5 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:z-10 text-base transition-all duration-300 pr-12"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setActiveField('password')}
                  onBlur={() => setActiveField(null)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-blue-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Ingat saya
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  Lupa password?
                </a>
              </div>
            </div>

            <div>
              <motion.button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all duration-200 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <span>Masuk</span>
                    <FiArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.form>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-600">
              Belum memiliki akun?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                <span className="relative inline-block group">
                  Daftar sekarang
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform origin-bottom scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                </span>
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Decorative elements */}
      <div className="hidden lg:block absolute bottom-5 left-5 text-white/50 text-xs">
        &copy; {new Date().getFullYear()} RenterIn. All rights reserved.
      </div>
    </div>
  );
};

export default Login;