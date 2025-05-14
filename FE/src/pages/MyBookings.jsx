import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiClock, FiMapPin, FiCalendar, FiDollarSign, FiUsers, FiCheck, FiX, FiInfo, FiStar } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { format, isPast } from 'date-fns';
import { id } from 'date-fns/locale';

const MyBookings = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/transactions/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.success) {
          // Enhance bookings data with property details
          const enhancedBookings = await Promise.all(
            response.data.data.map(async (booking) => {
              try {
                const propertyRes = await axios.get(`http://localhost:3000/api/properties/${booking.property_id}`);
                return {
                  ...booking,
                  property: propertyRes.data.data
                };
              } catch (error) {
                console.error(`Error fetching property ${booking.property_id}:`, error);
                return {
                  ...booking,
                  property: { title: 'Properti tidak ditemukan', location: 'Lokasi tidak tersedia' }
                };
              }
            })
          );
          setBookings(enhancedBookings);
        } else {
          throw new Error('Failed to fetch bookings');
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Gagal memuat data pemesanan Anda');
        
        // Demo data for development
        setBookings([
          {
            id: 1,
            property_id: 101,
            checkin_date: '2024-05-15',
            checkout_date: '2024-05-18',
            guests_count: 2,
            total_amount: 1500000,
            status: 'confirmed',
            payment_status: 'paid',
            payment_method: 'credit_card',
            created_at: '2024-05-01T08:30:00Z',
            property: {
              id: 101,
              title: 'Cozy Apartment in Kemang',
              thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
              location: 'Kemang, Jakarta Selatan',
              price_per_night: 500000,
              rating_avg: 4.8
            }
          },
          {
            id: 2,
            property_id: 102,
            checkin_date: '2024-04-05',
            checkout_date: '2024-04-07',
            guests_count: 3,
            total_amount: 2200000,
            status: 'completed',
            payment_status: 'paid',
            payment_method: 'bank_transfer',
            created_at: '2024-03-25T10:15:00Z',
            property: {
              id: 102,
              title: 'Villa Bali Sunset',
              thumbnail: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2074&q=80',
              location: 'Seminyak, Bali',
              price_per_night: 1100000,
              rating_avg: 4.9
            }
          },
          {
            id: 3,
            property_id: 103,
            checkin_date: '2024-06-10',
            checkout_date: '2024-06-15',
            guests_count: 2,
            total_amount: 3000000,
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'ewallet',
            created_at: '2024-05-02T14:20:00Z',
            property: {
              id: 103,
              title: 'Modern Studio in Bandung',
              thumbnail: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
              location: 'Dago, Bandung',
              price_per_night: 600000,
              rating_avg: 4.5
            }
          },
          {
            id: 4,
            property_id: 104,
            checkin_date: '2023-12-28',
            checkout_date: '2024-01-02',
            guests_count: 4,
            total_amount: 5500000,
            status: 'completed',
            payment_status: 'paid',
            payment_method: 'credit_card',
            created_at: '2023-12-10T09:45:00Z',
            property: {
              id: 104,
              title: 'Luxury Villa with Pool',
              thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
              location: 'Ubud, Bali',
              price_per_night: 1375000,
              rating_avg: 4.7
            }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user.id]);

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateDuration = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Dikonfirmasi</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Menunggu</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Dibatalkan</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Selesai</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Dibayar</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Menunggu</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Gagal</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pemesanan ini?')) return;

    try {
      const response = await axios.patch(`http://localhost:3000/api/transactions/${id}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        toast.success('Pemesanan berhasil dibatalkan');
        
        // Update local state
        setBookings(bookings.map(booking => 
          booking.id === id ? { ...booking, status: 'cancelled' } : booking
        ));
      } else {
        throw new Error('Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Gagal membatalkan pemesanan');
    }
  };

  const handleWriteReview = (booking) => {
    navigate(`/properties/${booking.property_id}`, { state: { showReviewForm: true } });
  };

  // Filter bookings based on the active tab
  const filteredBookings = bookings.filter(booking => {
    const checkoutDate = new Date(booking.checkout_date);
    
    if (activeTab === 'upcoming') {
      return !isPast(checkoutDate) && booking.status !== 'cancelled';
    } else if (activeTab === 'past') {
      return isPast(checkoutDate) || booking.status === 'completed';
    } else if (activeTab === 'cancelled') {
      return booking.status === 'cancelled';
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-lg mx-auto">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Pemesanan Saya</h1>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mendatang
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'past'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Selesai
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cancelled'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dibatalkan
            </button>
          </nav>
        </div>

        {/* Booking list */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="md:flex">
                  {/* Property image */}
                  <div className="md:flex-shrink-0 h-48 md:h-auto md:w-56 overflow-hidden">
                    <img
                      className="h-full w-full object-cover md:h-full md:w-full"
                      src={booking.property?.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={booking.property?.title}
                    />
                  </div>
                  
                  {/* Booking details */}
                  <div className="p-6 flex-grow">
                    <div className="flex flex-wrap items-center justify-between mb-2">
                      <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {booking.property?.title}
                      </h2>
                      <div className="flex items-center">
                        {getStatusBadge(booking.status)}
                        <span className="mx-2">•</span>
                        {getPaymentStatusBadge(booking.payment_status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-4">
                      <FiMapPin className="mr-1" />
                      <span>{booking.property?.location}</span>
                      {booking.property?.rating_avg && (
                        <>
                          <span className="mx-2">•</span>
                          <div className="flex items-center">
                            <FiStar className="text-yellow-500" />
                            <span className="ml-1">{booking.property?.rating_avg.toFixed(1)}</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-full mr-3">
                          <FiCalendar className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tanggal</p>
                          <p className="font-medium">{formatDate(booking.checkin_date)} - {formatDate(booking.checkout_date)}</p>
                          <p className="text-sm text-gray-500">{calculateDuration(booking.checkin_date, booking.checkout_date)} malam</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-full mr-3">
                          <FiUsers className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tamu</p>
                          <p className="font-medium">{booking.guests_count} orang</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-full mr-3">
                          <FiDollarSign className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-medium">{formatCurrency(booking.total_amount)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={`/properties/${booking.property_id}`}
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Lihat Properti
                      </Link>

                      {booking.status === 'confirmed' && !isPast(new Date(booking.checkin_date)) && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                        >
                          <FiX className="mr-1" /> Batalkan
                        </button>
                      )}

                      {(booking.status === 'completed' || isPast(new Date(booking.checkout_date))) && (
                        <button
                          onClick={() => handleWriteReview(booking)}
                          className="flex items-center justify-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50"
                        >
                          <FiStar className="mr-1" /> Beri Ulasan
                        </button>
                      )}

                      {booking.status === 'pending' && booking.payment_status === 'pending' && (
                        <button
                          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-sm font-medium rounded-md text-white hover:bg-blue-700"
                        >
                          <FiDollarSign className="mr-1" /> Bayar Sekarang
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <FiInfo className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pemesanan {activeTab === 'cancelled' ? 'yang dibatalkan' : activeTab === 'past' ? 'yang selesai' : 'mendatang'}</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'upcoming' ? 'Jelajahi properti menarik dan mulai petualangan penginapan Anda.' : 'Pemesanan Anda akan muncul di sini.'}
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Jelajahi Properti
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;