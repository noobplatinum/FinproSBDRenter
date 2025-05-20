import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
// Import icons - remove FiPhone, add FiChevronDown, FiPlusCircle, FiDollarSign (or coin icon)
import { FiUser, FiMail, FiMapPin, FiLock, FiEye, FiEyeOff, FiSave, FiEdit2, FiTrash2, FiChevronDown, FiPlusCircle, FiDollarSign } from 'react-icons/fi'; // Added FiDollarSign
import axios from 'axios'; // Assuming 'api' is configured correctly using axios instance elsewhere
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
// Assuming api is correctly configured to use the token header by default
import api from '../services/api'; // Use the configured api instance

const Profile = () => {
  const { user, logout, updateUserData } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.location || '',
    age: user?.age || '',
    gender: user?.gender || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- NEW STATE FOR MANUAL TOPUP ---
  const [topUpAmountInput, setTopUpAmountInput] = useState(''); // State for the input value
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [activeField, setActiveField] = useState(null); // State to track active input/select field - already exists, just ensure it works for topup input
  // --- END NEW STATE ---


  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(user?.profile_image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y');
  const [isUploadingImage, setIsUploadingImage] = useState(false);


  // Set initial form values when user data is available
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        age: user.age || '',
        gender: user.gender || '',
      });

      if (user.profile_image) {
        setPreviewImage(user.profile_image);
      }
    } else {
        // Redirect to login if user is null (not logged in)
        navigate('/login');
    }
  }, [user, navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // --- Validate Updated Form Fields ---
    const { name, email, location, age, gender } = profileForm;

    if (!name.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }

    if (!email.trim()) {
      toast.error('Email tidak boleh kosong');
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

    // Gender Validation
    if (!gender) {
        toast.error('Jenis Kelamin harus dipilih');
        return;
    }
    // --- End Validation ---

    setIsSubmittingProfile(true);

    try {
      const response = await api.put(
        `/accounts/${user.id}`,
        {
          name: name,
          email: email,
          location: location,
          age: ageNumber,
          gender: gender,
        }
      );

      if (response.data.success) {
        toast.success('Profil berhasil diperbarui');
        updateUserData({
          ...user,
          name: name,
          email: email,
          location: location,
          age: ageNumber,
          gender: gender,
        });
        setIsEditingProfile(false);
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || error.message || 'Gagal memperbarui profil');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleUploadImage = async () => {
    if (!profileImage) return;

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', profileImage);

      const response = await api.post(
        `/accounts/${user.id}/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (response.data.success) {
        toast.success('Foto profil berhasil diperbarui');
        updateUserData({
          ...user,
          profile_image: response.data.data.image_url
        });
      } else {
         throw new Error(response.data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
       toast.error(error.response?.data?.message || error.message || 'Gagal mengunggah foto profil');
    } finally {
      setIsUploadingImage(false);
      setProfileImage(null);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    // Validate password fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Semua field password harus diisi');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Password baru dan konfirmasi password tidak cocok');
      return;
    }

    setIsSubmittingPassword(true);

    try {
      const response = await api.put(
        `/accounts/${user.id}/password`,
        {
          current_password: currentPassword,
          new_password: newPassword
        }
      );

      if (response.data.success) {
        toast.success('Password berhasil diperbarui');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setIsChangingPassword(false);
      } else {
        throw new Error(response.data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
       toast.error(error.response?.data?.message || error.message || 'Gagal memperbarui password');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm(
      'Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.'
    );

    if (!isConfirmed) return;

    setIsDeleting(true);

    try {
      const response = await api.delete(`/accounts/${user.id}`);

      if (response.data.success) {
        toast.success('Akun berhasil dihapus');
        logout();
        navigate('/');
      } else {
        throw new Error(response.data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.message || error.message || 'Gagal menghapus akun');
    } finally {
      setIsDeleting(false);
    }
  };

  // --- NEW: Handle Top Up Input Change ---
  const handleTopUpInputChange = (e) => {
    // Allow only numbers
    const value = e.target.value.replace(/\D/g, '');
    setTopUpAmountInput(value);
  };
  // --- END NEW: Handle Top Up Input Change ---


  // --- MODIFIED Handle Top Up ---
  const handleTopUp = async () => {
      if (!user) {
          toast.error('Anda harus login untuk melakukan top up.');
          return;
      }

      const amountString = topUpAmountInput;
      const amountNumber = parseInt(amountString, 10);

      // Validate the input amount
      if (!amountString.trim() || isNaN(amountNumber) || amountNumber <= 0) {
          toast.error('Masukkan jumlah poin top up yang valid (angka positif).');
          return;
      }

      // Optional: Set a maximum limit for a single top-up (e.g., 100,000)
      // if (amountNumber > 100000) {
      //     toast.error('Jumlah top up maksimal adalah 100.000 poin per transaksi demo.');
      //     return;
      // }


      setIsToppingUp(true);

      try {
          // Calculate new total points
          const currentPoints = user.points || 0; // Use 0 if user.points is null/undefined
          const newPoints = currentPoints + amountNumber;

          // Call the update endpoint with only the points field
          const response = await api.put(`/accounts/${user.id}`, {
              points: newPoints
          });

          if (response.data.success) {
              toast.success(`Berhasil top up ${formatPoints(amountNumber)} poin!`); // Use amountNumber for toast
              // Update the user data in AuthContext with the new points
              updateUserData(response.data.data); // Assuming backend returns updated user
              setTopUpAmountInput(''); // Clear the input field
          } else {
              throw new Error(response.data.message || 'Failed to top up points');
          }

      } catch (error) {
          console.error('Error topping up points:', error);
           toast.error(error.response?.data?.message || error.message || 'Gagal top up poin, silakan coba lagi');
      } finally {
          setIsToppingUp(false);
      }
  };
  // --- END MODIFIED Handle Top Up ---

   // Helper to format points for display
   const formatPoints = (amount) => {
      if (typeof amount !== 'number' || isNaN(amount)) return '0';
      return new Intl.NumberFormat('id-ID', {
           minimumFractionDigits: 0
      }).format(amount);
   }

   // Check if the top-up input is valid for enabling the button
   const isTopUpAmountValid = parseInt(topUpAmountInput, 10) > 0;


   if (!user) {
       return <div className="min-h-screen flex items-center justify-center text-gray-600">Memuat profil...</div>;
   }


  return (
    <div className="bg-gray-50 py-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profil Saya</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* Profile header with image */}
          <div className="bg-blue-600 p-6 sm:p-10 text-white relative">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden bg-blue-400 border-4 border-white">
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <label htmlFor="profile-image" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiEdit2 className="text-white h-6 w-6" />
                  <input
                    id="profile-image"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isUploadingImage}
                  />
                </label>
                {profileImage && (
                  <div className="absolute -bottom-2 -right-2">
                    <button
                      onClick={handleUploadImage}
                      disabled={isUploadingImage}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingImage ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                      ) : (
                        <FiSave className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div>
                 {/* Display user role */}
                 <p className="text-sm font-medium text-blue-200 uppercase">{user?.role}</p>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-blue-100">{user?.email}</p>
                {/* Display user points if available */}
                 {user?.points !== undefined && (
                    <p className="text-yellow-300 text-lg font-bold mt-2">Poin: {formatPoints(user.points)}</p>
                 )}
                <p className="text-blue-100 mt-1">Bergabung sejak {new Date(user?.created_at || Date.now()).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Profile information and form */}
          <div className="p-6 sm:p-10">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Informasi Pribadi</h3>
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="text-blue-600 hover:text-blue-800 flex items-center bg-white"
                  >
                    <FiEdit2 className="mr-1" /> Edit
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Batal
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {/* Name Input */}
                  <div className={`relative transition-all duration-300 ${ activeField === 'name' ? 'transform -translate-y-1' : '' }`}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className={`h-5 w-5 transition-colors ${ activeField === 'name' ? 'text-blue-600' : 'text-gray-400' }`} />
                    </div>
                    <input
                      type="text" id="name" name="name" required
                      className="appearance-none rounded-lg relative block w-full px-3 py-2.5 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:z-10 text-base transition-all duration-300"
                      placeholder="Nama Lengkap" value={profileForm.name} onChange={handleProfileChange}
                      onFocus={() => setActiveField('name')} onBlur={() => setActiveField(null)}
                    />
                  </div>

                  {/* Email Input */}
                   <div className={`relative transition-all duration-300 ${ activeField === 'email' ? 'transform -translate-y-1' : '' }`}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className={`h-5 w-5 transition-colors ${ activeField === 'email' ? 'text-blue-600' : 'text-gray-400' }`} />
                    </div>
                    <input
                      type="email" id="email" name="email" autoComplete="email" required
                      className="appearance-none rounded-lg relative block w-full px-3 py-2.5 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:z-10 text-base transition-all duration-300"
                      placeholder="Email" value={profileForm.email} onChange={handleProfileChange}
                      onFocus={() => setActiveField('email')} onBlur={() => setActiveField(null)}
                    />
                  </div>

                  {/* Age Input */}
                   <div className={`relative transition-all duration-300 ${ activeField === 'age' ? 'transform -translate-y-1' : '' }`}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className={`h-5 w-5 transition-colors ${ activeField === 'age' ? 'text-blue-600' : 'text-gray-400' }`} />
                    </div>
                    <input
                      type="number" id="age" name="age" required
                      min="1" max="150"
                      className="appearance-none rounded-lg relative block w-full px-3 py-2.5 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:z-10 text-base transition-all duration-300"
                      placeholder="Usia" value={profileForm.age} onChange={handleProfileChange}
                      onFocus={() => setActiveField('age')} onBlur={() => setActiveField(null)}
                    />
                  </div>

                   {/* Gender Select */}
                   <div className={`relative transition-all duration-300 ${ activeField === 'gender' ? 'transform -translate-y-1' : '' }`}>
                     {/* Left Icon */}
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className={`h-5 w-5 transition-colors ${ activeField === 'gender' ? 'text-blue-600' : 'text-gray-400' }`} />
                    </div>
                    {/* Select Element */}
                    <select
                      id="gender" name="gender" required
                      className="appearance-none rounded-lg relative block w-full px-3 py-2.5 pl-10 pr-10 border border-gray-300 text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:z-10 text-base transition-all duration-300 cursor-pointer"
                      value={profileForm.gender} onChange={handleProfileChange}
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
                      <FiChevronDown className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Location Input */}
                   <div className={`relative transition-all duration-300 ${ activeField === 'location' ? 'transform -translate-y-1' : '' }`}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMapPin className={`h-5 w-5 transition-colors ${ activeField === 'location' ? 'text-blue-600' : 'text-gray-400' }`} />
                    </div>
                    <input
                      type="text" id="location" name="location" required
                      className="appearance-none rounded-lg relative block w-full px-3 py-2.5 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:z-10 text-base transition-all duration-300"
                      placeholder="Lokasi (Kota)" value={profileForm.location} onChange={handleProfileChange}
                      onFocus={() => setActiveField('location')} onBlur={() => setActiveField(null)}
                    />
                  </div>


                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmittingProfile}
                    >
                      {isSubmittingProfile ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <FiSave className="mr-2" /> Simpan Perubahan
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm text-gray-500 mb-1">Nama Lengkap</h4>
                      <p className="text-gray-900">{user?.name || '-'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm text-gray-500 mb-1">Email</h4>
                      <p className="text-gray-900">{user?.email || '-'}</p>
                    </div>

                    {/* Display Age */}
                    <div>
                      <h4 className="text-sm text-gray-500 mb-1">Usia</h4>
                      <p className="text-gray-900">{user?.age ? `${user.age} tahun` : '-'}</p>
                    </div>

                    {/* Display Gender */}
                     <div>
                      <h4 className="text-sm text-gray-500 mb-1">Jenis Kelamin</h4>
                      <p className="text-gray-900">{user?.gender || '-'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm text-gray-500 mb-1">Lokasi</h4>
                      <p className="text-gray-900">{user?.location || '-'}</p>
                    </div>

                     {/* Display Role if applicable */}
                     <div>
                        <h4 className="text-sm text-gray-500 mb-1">Role</h4>
                        <p className="text-gray-900">{user?.role || '-'}</p>
                     </div>

                  </div>
                </div>
              )}
            </div>

            {/* Change Password Section */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 ">Keamanan Akun</h3>
                {!isChangingPassword ? (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="text-blue-600 hover:text-blue-800 flex items-center bg-white"
                  >
                    <FiLock className="mr-1" /> Ubah Password
                  </button>
                ) : (
                  <button
                    onClick={() => setIsChangingPassword(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Batal
                  </button>
                )}
              </div>

              {isChangingPassword && (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Password Saat Ini
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-gray-400" />
                      </div>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Password saat ini"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Password Baru
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-gray-400" />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Password baru"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          {showNewPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Konfirmasi password baru"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmittingPassword}
                    >
                      {isSubmittingPassword ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Menyimpan...
                        </>
                      ) : (
                        'Ubah Password'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Account deletion */}
              <div className="mt-10">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hapus Akun</h3>
                <p className="text-gray-600 mb-4">
                  Menghapus akun akan menghapus semua data dan tidak dapat dikembalikan.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="mr-2" /> Hapus akun saya
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* --- NEW: Top Up Points Section (Only for Users) --- */}
            {user?.role === 'user' && (
              <div className="border-t border-gray-200 pt-8 mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Top Up Poin</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Masukkan jumlah poin yang ingin Anda tambahkan.
                </p>
                 {/* Input Field and Button for Top Up */}
                 <div className="flex gap-4 items-start">
                   <div className={`relative flex-grow transition-all duration-300 ${ activeField === 'topUpAmount' ? 'transform -translate-y-1' : '' }`}>
                     {/* Left Icon */}
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {/* Using FiDollarSign or a coin icon */}
                        <FiDollarSign className={`h-5 w-5 transition-colors ${ activeField === 'topUpAmount' ? 'text-green-600' : 'text-gray-400' }`} />
                      </div>
                     <input
                       type="number"
                       id="topUpAmount"
                       name="topUpAmount"
                       min="1"
                       className="appearance-none rounded-lg relative block w-full px-3 py-2.5 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 focus:z-10 text-base transition-all duration-300" // Adjusted colors for green theme
                       placeholder="Masukkan jumlah poin"
                       value={topUpAmountInput}
                       onChange={handleTopUpInputChange}
                       onFocus={() => setActiveField('topUpAmount')}
                       onBlur={() => setActiveField(null)}
                       disabled={isToppingUp}
                     />
                   </div>
                   <button
                     onClick={handleTopUp}
                     className="flex items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200" // Adjusted py to match input height
                     disabled={isToppingUp || !isTopUpAmountValid} // Disable if processing or input is invalid
                   >
                     {isToppingUp ? (
                       <>
                         <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         Memproses...
                       </>
                     ) : (
                       <>
                         <FiPlusCircle className="mr-2" /> Top Up
                       </>
                     )}
                   </button>
                 </div>
                 <p className="text-xs text-gray-500 mt-2">
                    (Ini adalah fitur demo top up gratis. Dalam aplikasi nyata, ini akan terintegrasi dengan gateway pembayaran.)
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;