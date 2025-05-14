import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiEye, FiEyeOff, FiSave, FiEdit2, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout, updateUserData } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
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
  
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(user?.profile_image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Set initial form values when user data is available
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
      });
      
      if (user.profile_image) {
        setPreviewImage(user.profile_image);
      }
    }
  }, [user]);

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
    
    // Validate form fields
    if (!profileForm.name.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }
    
    if (!profileForm.email.trim()) {
      toast.error('Email tidak boleh kosong');
      return;
    }
    
    // Email validation with regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileForm.email)) {
      toast.error('Format email tidak valid');
      return;
    }
    
    setIsSubmittingProfile(true);
    
    try {
      const response = await axios.put(
        `http://localhost:3000/api/accounts/${user.id}`,
        {
          name: profileForm.name,
          email: profileForm.email,
          phone: profileForm.phone,
          location: profileForm.location,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Profil berhasil diperbarui');
        updateUserData({
          ...user,
          name: profileForm.name,
          email: profileForm.email,
          phone: profileForm.phone,
          location: profileForm.location,
        });
        setIsEditingProfile(false);
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil');
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
      
      const response = await axios.post(
        `http://localhost:3000/api/accounts/${user.id}/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
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
      toast.error('Gagal mengunggah foto profil');
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
      const response = await axios.put(
        `http://localhost:3000/api/accounts/${user.id}/password`,
        {
          current_password: currentPassword,
          new_password: newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
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
      toast.error(error.response?.data?.message || 'Gagal memperbarui password');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Show confirmation dialog
    const isConfirmed = window.confirm(
      'Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.'
    );
    
    if (!isConfirmed) return;
    
    setIsDeleting(true);
    
    try {
      const response = await axios.delete(`http://localhost:3000/api/accounts/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        toast.success('Akun berhasil dihapus');
        logout();
        navigate('/');
      } else {
        throw new Error(response.data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus akun');
    } finally {
      setIsDeleting(false);
    }
  };

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
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-md"
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
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-blue-100">{user?.email}</p>
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
                    className="text-blue-600 hover:text-blue-800 flex items-center"
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
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nama Lengkap"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Telepon
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nomor Telepon"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Lokasi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMapPin className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={profileForm.location}
                        onChange={handleProfileChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Lokasi (Kota)"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

                    <div>
                      <h4 className="text-sm text-gray-500 mb-1">Nomor Telepon</h4>
                      <p className="text-gray-900">{user?.phone || '-'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm text-gray-500 mb-1">Lokasi</h4>
                      <p className="text-gray-900">{user?.location || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password Section */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Keamanan Akun</h3>
                {!isChangingPassword ? (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
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
                <form onSubmit={handleUpdatePassword} className="space-y-6">
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
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                  className="flex items-center text-red-600 hover:text-red-800 font-medium"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;