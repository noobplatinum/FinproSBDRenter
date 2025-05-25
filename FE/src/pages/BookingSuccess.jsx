import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FiCheckCircle, FiCalendar, FiUsers, FiClock, FiFileText, FiArrowRight } from 'react-icons/fi';
import confetti from 'canvas-confetti';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    transactionId, 
    propertyName, 
    checkInDate, 
    checkOutDate, 
    totalAmount, 
    nights, 
    guests 
  } = location.state || {};
  
  // Redirect if no transaction data
  useEffect(() => {
    if (!transactionId) {
      navigate('/');
    }
  }, [transactionId, navigate]);
  
  // Trigger confetti animation on load
  useEffect(() => {
    if (transactionId) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [transactionId]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('id-ID', options);
  };
  
  // If no transaction data, show empty state
  if (!transactionId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl text-gray-700">Tidak ada data pemesanan</h2>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 py-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-5">
              <FiCheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Pemesanan Berhasil!</h1>
            <p className="text-gray-600">
              Terima kasih atas pemesanan Anda. Detail pemesanan telah dikirim ke email Anda.
            </p>
          </div>
          
          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Detail Pemesanan</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FiFileText className="h-5 w-5 text-gray-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">ID Pemesanan</p>
                  <p className="font-medium text-gray-900">#{transactionId}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FiClock className="h-5 w-5 text-gray-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Durasi Menginap</p>
                  <p className="font-medium text-gray-900">{nights} malam</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FiCalendar className="h-5 w-5 text-gray-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Check-in</p>
                  <p className="font-medium text-gray-900">{formatDate(checkInDate)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FiCalendar className="h-5 w-5 text-gray-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Check-out</p>
                  <p className="font-medium text-gray-900">{formatDate(checkOutDate)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FiUsers className="h-5 w-5 text-gray-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Jumlah Tamu</p>
                  <p className="font-medium text-gray-900">{guests} tamu</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Properti</h2>
            <div className="flex gap-4 items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{propertyName}</h3>
                <p className="text-sm text-gray-600 mb-1">Alamat dan detail lokasi akan dikirim ke email Anda</p>
                <p className="text-sm text-gray-500">
                  Check-in: Setelah 14:00 • Check-out: Sebelum 12:00
                </p>
              </div>
            </div>
          </div>
          
          {/* Payment Info */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Pembayaran</h2>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between font-bold">
                <span className="text-gray-900">Total Pembayaran</span>
                <span className="text-gray-900">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="mt-1">
                <p className="text-sm text-gray-500">Status Pembayaran: <span className="text-green-600 font-medium">Lunas</span></p>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/my-bookings" 
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-center flex items-center justify-center"
            >
              Lihat Semua Pemesanan
              <FiArrowRight className="ml-2" />
            </Link>
            <Link 
              to="/" 
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-center"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
        
        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Butuh bantuan dengan pemesanan Anda?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800">Hubungi Dukungan</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;