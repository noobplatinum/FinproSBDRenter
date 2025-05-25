import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiClock, FiMapPin, FiCalendar, FiDollarSign, FiUsers, FiCheck, FiX, FiInfo, FiStar } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { format, isPast } from 'date-fns';
import { id } from 'date-fns/locale';

const StarRating = ({ booking, onRatingUpdate }) => {
  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Check if user already rated this property
    const checkExistingRating = async () => {
      if (!booking?.property_id || !user?.id) return;

      try {
        const response = await axios.get(
          `https://finpro-sbd-renter-backend.vercel.app/api/ratings/user/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          const userRatings = response.data.data;
          const propertyRating = userRatings.find(r => r.property_id == booking.property_id);
          
          if (propertyRating) {
            setExistingRating(propertyRating);
            setRating(propertyRating.rating);
            setComment(propertyRating.comment || '');
          }
        }
      } catch (error) {
        console.error('Error checking existing rating:', error);
      }
    };

    checkExistingRating();
  }, [booking, user]);

  const handleStarClick = (starValue) => {
    if (existingRating) return; // Don't allow changes if already rated
    setRating(starValue);
    setShowForm(true);
  };

  const handleStarHover = (starValue) => {
    if (existingRating) return;
    setHoverRating(starValue);
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error('Silakan pilih rating bintang terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    try {
      const ratingData = {
        user_id: user.id,
        property_id: booking.property_id,
        rating: rating,
        comment: comment.trim()
      };

      const response = await axios.post(
        'https://finpro-sbd-renter-backend.vercel.app/api/ratings',
        ratingData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Terima kasih! Rating Anda telah dikirim');
        setExistingRating(response.data.data);
        setShowForm(false);
        
        if (onRatingUpdate) {
          onRatingUpdate(booking.id);
        }
      } else {
        throw new Error(response.data.message || 'Gagal mengirim rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error(error.response?.data?.message || 'Gagal mengirim rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="star-rating-container">
      {/* Show existing rating */}
      {existingRating && (
        <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <h4 className="text-sm font-medium text-green-900">
              Rating Anda untuk properti ini:
            </h4>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`text-base sm:text-lg ${
                    star <= existingRating.rating 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium text-green-700">
                ({existingRating.rating}/5)
              </span>
            </div>
          </div>
          {existingRating.comment && (
            <p className="text-sm text-green-800 italic mt-2 leading-relaxed">
              "{existingRating.comment}"
            </p>
          )}
        </div>
      )}

      {/* Show rating form for new ratings */}
      {!existingRating && (
        <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3 leading-relaxed">
            Bagaimana pengalaman Anda? Berikan rating untuk properti ini:
          </h4>
          
          {/* Star Rating Input - Mobile Optimized */}
          <div className="mb-4">
            <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="text-xl sm:text-2xl transition-all duration-200 cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded-full p-1 bg-white"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${star} stars`}
                >
                  <FiStar 
                    className={`${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div className="text-center sm:text-left">
                <span className="text-sm text-gray-600">
                  {rating} dari 5 bintang
                </span>
              </div>
            )}
          </div>

          {/* Comment form (shows after selecting stars) */}
          {showForm && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ulasan (Opsional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan pengalaman Anda menginap di properti ini..."
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {comment.length}/500 karakter
                  </p>
                </div>
              </div>

              {/* Action buttons - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSubmitRating}
                  disabled={isSubmitting || rating === 0}
                  className={`flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors w-full sm:w-auto ${
                    isSubmitting || rating === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <FiCheck className="mr-1.5" />
                      Kirim Rating
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setShowForm(false);
                    setRating(0);
                    setComment('');
                    setHoverRating(0);
                  }}
                  disabled={isSubmitting}
                  className="flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 w-full sm:w-auto"
                >
                  <FiX className="mr-1.5" />
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MyBookings = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.id) {
      setLoading(false);
      setError("Informasi pengguna tidak tersedia. Silakan login kembali.");
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching bookings for user ID: ${user.id}`);
        const response = await axios.get(`https://finpro-sbd-renter-backend.vercel.app/api/transactions/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        console.log('API Response for transactions:', response.data);

        if (response.data.success && Array.isArray(response.data.data)) {
          console.log('Raw bookings from API:', response.data.data); 
          
          const enhancedBookings = await Promise.all(
            response.data.data.map(async (booking) => {
              if (!booking.property_id) {
                console.warn('Booking missing property_id:', booking);
                return {
                  ...booking,
                  property: {
                    title: 'Detail Properti Tidak Lengkap',
                    location: 'Lokasi tidak tersedia',
                    thumbnail: 'https://via.placeholder.com/300x200?text=No+Property+ID',
                    price_per_night: 0,
                    rating_avg: null
                  }
                };
              }

              try {
                // Fetch property data
                const propertyRes = await axios.get(`https://finpro-sbd-renter-backend.vercel.app/api/properties/${booking.property_id}`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
                });

                // Fetch thumbnail for this property
                let thumbnailUrl = 'https://via.placeholder.com/300x200?text=No+Image';
                try {
                  const thumbnailRes = await axios.get(`https://finpro-sbd-renter-backend.vercel.app/api/images/property/${booking.property_id}/thumbnail`, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                  });
                  
                  if (thumbnailRes.data.success && thumbnailRes.data.data) {
                    thumbnailUrl = thumbnailRes.data.data.url;
                  }
                } catch (thumbnailError) {
                  console.warn(`No thumbnail found for property ${booking.property_id}:`, thumbnailError);
                  // Keep default placeholder
                }

                const propertyData = propertyRes.data && propertyRes.data.data ? propertyRes.data.data : null;
                
                return {
                  ...booking,
                  property: propertyData ? {
                    ...propertyData,
                    thumbnail: thumbnailUrl
                  } : {
                    title: 'Properti tidak ditemukan',
                    location: 'Lokasi tidak tersedia',
                    thumbnail: 'https://via.placeholder.com/300x200?text=Property+Not+Found',
                    price_per_night: 0,
                    rating_avg: null
                  }
                };
              } catch (propertyError) {
                console.error(`Error fetching property ${booking.property_id}:`, propertyError);
                return {
                  ...booking,
                  property: {
                    title: 'Properti tidak ditemukan (Error)',
                    location: 'Lokasi tidak tersedia',
                    thumbnail: 'https://via.placeholder.com/300x200?text=Fetch+Error',
                    price_per_night: 0,
                    rating_avg: null
                  }
                };
              }
            })
          );
          
          console.log('Enhanced bookings with property data and thumbnails:', enhancedBookings);
          setBookings(enhancedBookings);
        } else {
          console.warn('Failed to fetch bookings or data format is incorrect:', response.data);
          setBookings([]); 
          if (!response.data.success) {
            setError(response.data.message || 'Gagal mengambil data pemesanan.');
          }
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Gagal memuat data pemesanan Anda. Coba lagi nanti.');
        setBookings([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]); 

  const formatDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak valid';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Tanggal tidak valid';
    }
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' && typeof amount !== 'string') return 'Harga tidak valid';
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) return 'Harga tidak valid';
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(numericAmount);
  };

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    try {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : (start.toDateString() === end.toDateString() ? 1 : 0);
    } catch (e) {
      console.error("Error calculating duration:", checkIn, checkOut, e);
      return 0;
    }
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
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status || 'Tidak Diketahui'}</span>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Dibayar</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Menunggu Pembayaran</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Gagal</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status || 'Tidak Diketahui'}</span>;
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pemesanan ini?')) return;

    try {
      const response = await axios.patch(`https://finpro-sbd-renter-backend.vercel.app/api/transactions/${bookingId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        toast.success('Pemesanan berhasil dibatalkan');
        setBookings(prevBookings => 
          prevBookings.map(b => 
            b.id === bookingId ? { ...b, status: 'cancelled' } : b
          )
        );
      } else {
        throw new Error(response.data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || 'Gagal membatalkan pemesanan');
    }
  };

  const handleWriteReview = (booking) => {
    if (booking && booking.property_id) {
      navigate(`/properties/${booking.property_id}`, { state: { showReviewForm: true, bookingId: booking.id } });
    } else {
      toast.error("Detail properti tidak ditemukan untuk menulis ulasan.");
    }
  };

  // Handle rating update callback
  const handleRatingUpdate = async (bookingId) => {
    // Refresh property rating by refetching the booking data
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking?.property_id) {
        const propertyRes = await axios.get(`https://finpro-sbd-renter-backend.vercel.app/api/properties/${booking.property_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (propertyRes.data.success) {
          setBookings(prevBookings => 
            prevBookings.map(b => 
              b.id === bookingId 
                ? { 
                    ...b, 
                    property: { 
                      ...b.property, 
                      rating_avg: propertyRes.data.data.rating_avg 
                    } 
                  } 
                : b
            )
          );
        }
      }
    } catch (error) {
      console.error('Error refreshing property rating:', error);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (!booking || !booking.end_date || !booking.status) {
        console.warn("Skipping booking due to missing end_date or status:", booking);
        return false;
    }
    try {
      const checkoutDateObj = new Date(booking.end_date);
      if (isNaN(checkoutDateObj.getTime())) {
        console.warn("Invalid end_date for booking:", booking.id, booking.end_date);
        return false;
      }

      if (activeTab === 'upcoming') {
        return !isPast(checkoutDateObj) && booking.status !== 'cancelled' && booking.status !== 'completed';
      } else if (activeTab === 'past') {
        return isPast(checkoutDateObj) || booking.status === 'completed';
      } else if (activeTab === 'cancelled') {
        return booking.status === 'cancelled';
      }
    } catch (e) {
      console.error("Error parsing end_date for filtering:", booking.id, booking.end_date, e);
      return false;
    }
    return false;
  });
  
  console.log(`Active tab: ${activeTab}, Filtered bookings count: ${filteredBookings.length}`, filteredBookings);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <p className="ml-4 text-lg">Memuat data pemesanan...</p>
      </div>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <div className="container mx-auto p-4 py-12 text-center">
         <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-100 rounded-full">
                <FiX className="h-8 w-8 text-red-500" />
              </div>
            </div>
        <h2 className="text-xl font-semibold text-red-600 mb-2">Oops! Terjadi Kesalahan</h2>
        <p className="text-gray-700">{error}</p>
        <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-black bg-blue-600 hover:bg-blue-700"
        >
            Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Pemesanan Saya</h1>

        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600 bg-blue-400'
                  : 'border-transparent hover:text-black text-gray-700 hover:border-blue-300 bg-white border-black'
              } capitalize`}
            >
              Mendatang
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'past'
                  ? 'border-blue-500 text-blue-600 bg-blue-400'
                  : 'border-transparent hover:text-black text-gray-700 hover:border-blue-300 bg-white border-black'
              } capitalize`}
            >
              Selesai
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cancelled'
                 ? 'border-blue-500 text-blue-600 bg-blue-400'
                  : 'border-transparent hover:text-black text-gray-700 hover:border-blue-300 bg-white border-black'
              } capitalize`}
            >
              Dibatalkan
            </button>
          </nav>
        </div>

        {filteredBookings.length > 0 ? (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                <div className="md:flex">
                  <div className="md:flex-shrink-0 h-48 md:h-auto md:w-64 overflow-hidden">
                    <img
                      className="h-full w-full object-cover"
                      src={booking.property?.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={booking.property?.title || 'Gambar Properti'}
                    />
                  </div>
                  
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-start justify-between mb-2">
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 mr-2">
                          {booking.property?.title || 'Nama Properti Tidak Tersedia'}
                        </h2>
                        <div className="flex items-center flex-shrink-0 mt-1 md:mt-0">
                          {getStatusBadge(booking.status)}
                          <span className="mx-2 text-gray-400">•</span>
                          {getPaymentStatusBadge(booking.payment_status)}
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-600 text-sm mb-1">
                        <FiMapPin className="mr-1.5 flex-shrink-0" />
                        <span>{booking.property?.location || 'Lokasi Tidak Tersedia'}</span>
                      </div>
                      
                      {booking.property && typeof booking.property.rating_avg === 'number' && booking.property.rating_avg > 0 && (
                        <div className="flex items-center text-gray-600 text-sm mb-4">
                            <FiStar className="text-yellow-500 mr-1.5 flex-shrink-0" />
                            <span>{booking.property.rating_avg.toFixed(1)} / 5.0</span>
                        </div>
                      )}
                      {!booking.property?.rating_avg && (
                        <div className="flex items-center text-black text-xs italic mb-4">
                           Belum ada rating
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mb-5">
                        <div className="flex items-center">
                          <div className="p-2.5 bg-blue-50 rounded-full mr-3 flex-shrink-0">
                            <FiCalendar className="text-blue-600 h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs text-black">Tanggal Menginap</p>
                            <p className="font-medium text-sm text-black">{formatDate(booking.start_date)} - {formatDate(booking.end_date)}</p>
                            <p className="text-xs text-black">{calculateDuration(booking.start_date, booking.end_date)} malam</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="p-2.5 bg-green-50 rounded-full mr-3 flex-shrink-0">
                            <FiUsers className="text-green-600 h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs text-black">Jumlah Tamu</p>
                            <p className="font-medium text-sm text-black">{booking.guest_count || 0} orang</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="p-2.5 bg-purple-50 rounded-full mr-3 flex-shrink-0">
                            <FiDollarSign className="text-purple-600 h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs text-black">Total Pembayaran</p>
                            <p className="font-medium text-sm text-black">{formatCurrency(booking.total_amount)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Star Rating Section - Show for completed/past bookings only */}
                      {(booking.status === 'completed' || (booking.status === 'confirmed' && isPast(new Date(booking.end_date)))) && (
                        <div className="mb-5">
                          <StarRating
                            booking={booking}
                            onRatingUpdate={handleRatingUpdate}
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-200 flex flex-wrap gap-3 items-center">
                      <Link
                        to={`/properties/${booking.property_id}`}
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Lihat Properti
                      </Link>

                      {/* Gunakan 'start_date' untuk logika pembatalan */}
                      {booking.status === 'confirmed' && !isPast(new Date(booking.start_date)) && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                        >
                          <FiX className="mr-1.5" /> Batalkan
                        </button>
                      )}

                      {booking.status === 'pending' && booking.payment_status === 'pending' && booking.payment_url && (
                        <a
                          href={booking.payment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          <FiDollarSign className="mr-1.5" /> Lanjutkan Pembayaran
                        </a>
                      )}
                      {booking.status === 'pending' && booking.payment_status === 'pending' && !booking.payment_url && (
                        <button
                          onClick={() => toast.error('URL Pembayaran tidak tersedia. Hubungi CS.')}
                          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          <FiDollarSign className="mr-1.5" /> Bayar Sekarang
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-5 bg-blue-100 rounded-full">
                <FiInfo className="h-10 w-10 text-blue-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'upcoming' && 'Tidak ada pemesanan mendatang'}
              {activeTab === 'past' && 'Riwayat pemesanan Anda masih kosong'}
              {activeTab === 'cancelled' && 'Tidak ada pemesanan yang dibatalkan'}
            </h3>
            <p className="text-gray-600 mb-8">
              {activeTab === 'upcoming' ? 'Saatnya merencanakan penginapan seru Anda berikutnya!' : 'Semua pemesanan Anda akan tercatat di sini.'}
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-black bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Jelajahi Properti Sekarang
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;