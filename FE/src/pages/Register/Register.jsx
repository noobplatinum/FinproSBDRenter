import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Import icons - add FiChevronDown for the custom dropdown arrow
import { FiUser, FiMail, FiLock, FiMapPin, FiEye, FiEyeOff, FiArrowRight, FiChevronDown } from 'react-icons/fi'; // Added FiChevronDown
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import RenterInLogo from '../../assets/RenterIn-logo.png';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '', // Use empty string as initial state for the select
    location: ''
  });
  const [selectedRole, setSelectedRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, location, age, gender } = formData;

    // --- Basic Frontend Validation ---
    if (!name || !email || !password || !confirmPassword || !location || !age || !gender) {
      toast.error('Semua field harus diisi');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    if (password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    // Email validation with regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Format email tidak valid');
      return;
    }

    // Age Validation
    const ageNumber = parseInt(age, 10);
    if (isNaN(ageNumber) || ageNumber <= 0 || ageNumber > 150) {
       toast.error('Usia harus angka positif dan valid (1-150)');
       return;
    }
    // --- End Validation ---

    setIsLoading(true);

    try {
      await register({
        name,
        email,
        password,
        location,
        age: ageNumber,
        gender
      }, selectedRole);

      toast.success('Registrasi berhasil! Silakan login.', {
        style: {
          borderRadius: '10px',
          background: '#22c55e',
          color: '#fff',
        },
      });

      setTimeout(() => navigate('/login'), 800);

    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Registrasi gagal, silakan coba lagi';
      toast.error(errorMsg, {
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
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Left: Register Form */}
      <motion.div
        initial={{ x: -200, opacity: 0 }}
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
              className="flex justify-center mb-6"
            >
              <div className="bg-white rounded-full p-3 shadow-lg flex items-center justify-center h-28 w-28 border-2 border-gray-100">
                <img
                  src={RenterInLogo}
                  alt="RenterIn Logo"
                  className="h-20 w-20 object-contain"
                />
              </div>
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent"
            >
              Bergabung dengan RenterIn
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-3 text-sm text-gray-600"
            >
              Daftarkan diri Anda untuk akses penuh ke semua fitur
            </motion.p>
          </div>

          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 space-y-4"
            onSubmit={handleSubmit}
          >
            {/* --- Input Fields (Name, Email, Age, Gender, Location, Passwords) --- */}
            <div className={`relative transition-all duration-300 ${ activeField === 'name' ? 'transform -translate-y-1' : '' }`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className={`h-5 w-5 transition-colors ${ activeField === 'name' ? 'text-blue-600' : 'text-gray-400' }`} />
              </div>
              <input
                id="name" name="name" type="text" required
                className="appearance-none rounded-lg relative block w-full px-3 py-3.5 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:z-10 text-base transition-all duration-300"
                placeholder="Nama Lengkap" value={formData.name} onChange={handleChange}
                onFocus={() => setActiveField('name')} onBlur={() => setActiveField(null)}
              />
            </div>

            <div className={`relative transition-all duration-300 ${ activeField === 'email' ? 'transform -translate-y-1' : '' }`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className={`h-5 w-5 transition-colors ${ activeField === 'email' ? 'text-blue-600' : 'text-gray-400' }`} />
              </div>
              <input
                id="email" name="email" type="email" autoComplete="email" required
                className="appearance-none rounded-lg relative block w-full px-3 py-3.5 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:z-10 text-base transition-all duration-300"
                placeholder="Email" value={formData.email} onChange={handleChange}
                onFocus={() => setActiveField('email')} onBlur={() => setActiveField(null)}
              />
            </div>

            <div className={`relative transition-all duration-300 ${ activeField === 'age' ? 'transform -translate-y-1' : '' }`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className={`h-5 w-5 transition-colors ${ activeField === 'age' ? 'text-blue-600' : 'text-gray-400' }`} />
              </div>
              <input
                id="age" name="age" type="number" required
                min="1" max="150"
                className="appearance-none rounded-lg relative block w-full px-3 py-3.5 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:z-10 text-base transition-all duration-300"
                placeholder="Usia" value={formData.age} onChange={handleChange}
                onFocus={() => setActiveField('age')} onBlur={() => setActiveField(null)}
              />
            </div>

            {/* --- MODIFIED GENDER SELECT --- */}
            <div className={`relative transition-all duration-300 ${ activeField === 'gender' ? 'transform -translate-y-1' : '' }`}>
              {/* Left Icon */}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {/* Using FiUser for consistency with other personal info */}
                <FiUser className={`h-5 w-5 transition-colors ${ activeField === 'gender' ? 'text-blue-600' : 'text-gray-400' }`} />
              </div>
               {/* Select Element */}
              <select
                id="gender" name="gender" required
                className="appearance-none rounded-lg relative block w-full px-3 py-3.5 pl-10 pr-10 border border-gray-300 text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:z-10 text-base transition-all duration-300 cursor-pointer" // Added pl-10 and cursor-pointer
                value={formData.gender} onChange={handleChange}
                onFocus={() => setActiveField('gender')} onBlur={() => setActiveField(null)}
              >
                <option value="" disabled>Pilih Jenis Kelamin</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
                <option value="other">Lainnya</option>
                <option value="prefer-not-to-say">Tidak ingin memberitahu</option>
              </select>
              {/* Custom Dropdown Icon */}
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-700">
                 <FiChevronDown className="h-5 w-5" /> {/* Using FiChevronDown */}
               </div>
            </div>
            {/* --- END MODIFIED GENDER SELECT --- */}

            <div className={`relative transition-all duration-300 ${ activeField === 'location' ? 'transform -translate-y-1' : '' }`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMapPin className={`h-5 w-5 transition-colors ${ activeField === 'location' ? 'text-blue-600' : 'text-gray-400' }`} />
              </div>
              <input
                id="location" name="location" type="text" required
                className="appearance-none rounded-lg relative block w-full px-3 py-3.5 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:z-10 text-base transition-all duration-300"
                placeholder="Lokasi (Kota)" value={formData.location} onChange={handleChange}
                onFocus={() => setActiveField('location')} onBlur={() => setActiveField(null)}
              />
            </div>

            <div className={`relative transition-all duration-300 ${ activeField === 'password' ? 'transform -translate-y-1' : '' }`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className={`h-5 w-5 transition-colors ${ activeField === 'password' ? 'text-blue-600' : 'text-gray-400' }`} />
              </div>
              <input
                id="password" name="password" type={showPassword ? "text" : "password"} required
                className="appearance-none rounded-lg relative block w-full px-3 py-3.5 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:z-10 text-base transition-all duration-300 pr-12"
                placeholder="Password" value={formData.password} onChange={handleChange}
                onFocus={() => setActiveField('password')} onBlur={() => setActiveField(null)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-blue-600 focus:outline-none transition-colors">
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className={`relative transition-all duration-300 ${ activeField === 'confirmPassword' ? 'transform -translate-y-1' : '' }`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className={`h-5 w-5 transition-colors ${ activeField === 'confirmPassword' ? 'text-blue-600' : 'text-gray-400' }`} />
              </div>
              <input
                id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required
                className="appearance-none rounded-lg relative block w-full px-3 py-3.5 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:z-10 text-base transition-all duration-300 pr-12"
                placeholder="Konfirmasi Password" value={formData.confirmPassword} onChange={handleChange}
                onFocus={() => setActiveField('confirmPassword')} onBlur={() => setActiveField(null)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400 hover:text-blue-600 focus:outline-none transition-colors">
                  {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            {/* --- End Input Fields --- */}


            {/* --- ROLE SELECTION SECTION --- */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 space-y-2"
            >
              <label className="block text-sm font-medium text-gray-700">Daftar sebagai:</label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    id="role-user" name="role" type="radio" value="user"
                    checked={selectedRole === 'user'} onChange={handleRoleChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 cursor-pointer"
                  />
                  <label htmlFor="role-user" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                    User Biasa
                  </label>
                </div>
                <div className="flex items-center">
                  {/* --- SECURITY WARNING: EXPLAIN THIS TO YOUR USER --- */}
                  {/* This UI element allows selecting 'admin'.
                       The backend MUST validate if the user is authorized to register as admin. */}
                  <input
                    id="role-admin" name="role" type="radio" value="admin"
                    checked={selectedRole === 'admin'} onChange={handleRoleChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 cursor-pointer"
                  />
                  <label htmlFor="role-admin" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                    Admin
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Pilih "User Biasa" untuk mendaftar sebagai pencari properti atau penyewa. Pilihan "Admin" hanya untuk penggunaan internal (membutuhkan validasi khusus di backend).
              </p>
            </motion.div>
            {/* --- END ROLE SELECTION SECTION --- */}


            <div>
              <motion.button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all duration-200 shadow-lg hover:shadow-xl mt-6"
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
                    <span>Daftar Sekarang</span>
                    <FiArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </motion.button>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-sm text-center text-gray-600"
            >
              Dengan mendaftar, Anda menyetujui{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Syarat & Ketentuan
              </a>{' '}
              dan{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Kebijakan Privasi
              </a>{' '}
              kami.
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="text-center mt-6"
            >
              <p className="text-sm text-gray-600">
                Sudah memiliki akun?{' '}
                <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  <span className="relative inline-block group">
                    Masuk
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform origin-bottom scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                  </span>
                </Link>
              </p>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>

      {/* Right: Image with overlay content */}
      <motion.div
        initial={{ x: 200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1509660933844-6910e12765a0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80')` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/80 to-blue-900/90"></div>
        </div>

        {/* Content overlay on the image */}
        <div className="absolute inset-0 flex flex-col justify-center px-12 text-white z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mb-8 flex items-center justify-center"
          >
            <div className="bg-white rounded-full p-3 shadow-xl flex items-center justify-center h-32 w-32">
              <img
                src={RenterInLogo}
                alt="RenterIn Logo"
                className="h-24 w-24 object-contain"
              />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-4xl font-bold mb-6"
          >
            Temukan Hunian Impian Anda Bersama RenterIn
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="text-xl text-gray-100 mb-10"
          >
            Mendaftar sebagai anggota membuka akses ke ribuan properti premium di seluruh Indonesia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="space-y-5"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white text-lg">Proses pendaftaran cepat dan mudah</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white text-lg">Simpan properti favorit Anda</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white text-lg">Pesan properti secara langsung</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer copyright */}
      <div className="hidden lg:block absolute bottom-5 right-5 text-white/50 text-xs">
        © {new Date().getFullYear()} RenterIn. All rights reserved.
      </div>
    </div>
  );
};

export default Register;