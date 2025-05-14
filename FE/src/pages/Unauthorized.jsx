import React from 'react';
import { Link } from 'react-router-dom';
import { FiLock, FiAlertTriangle } from 'react-icons/fi';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-3">
            <FiLock size={32} className="text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Akses Ditolak</h1>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <FiAlertTriangle className="text-yellow-500 mr-3" />
            <p className="text-sm text-yellow-700">
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
          Halaman ini hanya dapat diakses oleh administrator. Jika Anda yakin seharusnya memiliki akses, silakan hubungi administrator sistem.
        </p>
        
        <Link
          to="/"
          className="w-full inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;