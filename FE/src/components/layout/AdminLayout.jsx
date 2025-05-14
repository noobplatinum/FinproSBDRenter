import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiGrid, FiUser, FiShoppingBag, FiLogOut, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebarnya ya */}
      <div 
        className={`bg-white shadow-md fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:w-64`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
          <button 
            className="lg:hidden text-gray-500 focus:outline-none"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX size={24} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {/* Tambahkan link kembali ke home */}
          <Link 
            to="/"
            className="flex items-center p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            <FiArrowLeft className="mr-3" />
            <span>Kembali ke Home</span>
          </Link>
                    
          <Link 
            to="/admin"
            className="flex items-center p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            <FiGrid className="mr-3" />
            <span>Dashboard</span>
          </Link>
                    
          <Link 
            to="/admin/properties"
            className="flex items-center p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            <FiHome className="mr-3" />
            <span>Properti</span>
          </Link>
                    
          <Link 
            to="/admin/users"
            className="flex items-center p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            <FiUser className="mr-3" />
            <span>Pengguna</span>
          </Link>
                    
          <Link 
            to="/admin/transactions"
            className="flex items-center p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            <FiShoppingBag className="mr-3" />
            <span>Transaksi</span>
          </Link>
                    
          <button 
            onClick={handleLogout} 
            className="flex items-center w-full px-4 py-3 text-left bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg transition-colors"
          >
            <FiLogOut className="mr-2" />
            <span>Logout</span>
          </button>
          </nav>
          </div>
                
          {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="p-4 flex items-center">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 focus:outline-none mr-4"
            >
              <FiMenu size={24} />
            </button>
            <h2 className="text-lg font-medium">Admin Dashboard</h2>
          </div>
        </header>
        
        {/* Main */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;