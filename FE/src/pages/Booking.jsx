import { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FiCalendar, FiUsers, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
// import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import api from '../services/api';

const Booking = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // Ambil juga updateUserData dari context
  const { user, updateUserData } = useContext(AuthContext);

  const [thumbnail, setThumbnail] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState(
    location.state?.startDate ? new Date(location.state.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState(
    location.state?.endDate
      ? new Date(location.state.endDate)
      : new Date(new Date().setDate(new Date().getDate() + 1))
  );
  const [guests, setGuests] = useState(location.state?.guests || 1);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Anda harus login untuk melakukan pemesanan.');
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch thumbnail jika property sudah ada
  useEffect(() => {
    const fetchThumbnail = async () => {
      if (!property?.id) return;
      try {
        const thumbRes = await api.get(`/images/property/${property.id}/thumbnail`);
        if (thumbRes.data.success && thumbRes.data.data) {
          setThumbnail(thumbRes.data.data.url);
        } else {
          const imgs = await api.get(`/images/property/${property.id}`);
          if (imgs.data.success && imgs.data.data.length) {
            setThumbnail(imgs.data.data[0].url);
          }
        }
      } catch (err) {
        console.error('Could not load property thumbnail:', err);
      }
    };
    fetchThumbnail();
  }, [property]);

  // Fetch detail property
  useEffect(() => {
    if (!user) return;
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/properties/${id}`);
        if (res.data.success) {
          setProperty(res.data.data);
          // Pastikan endDate minimal 1 hari setelah startDate
          setEndDate(prev => {
            const min = new Date(startDate);
            min.setDate(min.getDate() + 1);
            return new Date(prev) <= startDate ? min : prev;
          });
        } else {
          throw new Error('Gagal memuat properti');
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Tidak dapat memuat data properti.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, user, startDate]);

  const calculateNights = () => {
    const start = startDate instanceof Date && !isNaN(startDate) ? startDate : new Date();
    const end = endDate instanceof Date && !isNaN(endDate)
      ? endDate
      : new Date(new Date().setDate(new Date().getDate() + 1));
    if (start >= end) return 1;
    const diffMs = end.getTime() - start.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const calculateSubtotal = () => property
    ? property.price_per_night * calculateNights()
    : 0;

  const calculateServiceFee = () => calculateSubtotal() * 0.1;
  const calculateTotalPoints = () => calculateSubtotal() + calculateServiceFee();

  const formatCurrency = amt => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(amt);

  const formatPoints = amt => typeof amt === 'number'
    ? new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(amt)
    : '0';

  const formatDate = date => {
    if (!date || isNaN(date)) return '-';
    return date.toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!user) {
      toast.error('Anda harus login untuk melakukan pemesanan.');
      return navigate('/login');
    }
    if (!property) {
      return toast.error('Data properti tidak lengkap.');
    }

    const totalPoints = calculateTotalPoints();
    if (user.points < totalPoints) {
      return toast.error(`Poin Anda (${formatPoints(user.points)}) tidak mencukupi. Butuh ${formatPoints(totalPoints)} poin.`);
    }
    if (calculateNights() <= 0 || guests <= 0 || guests > property.max_guests) {
      return toast.error('Periksa kembali tanggal pemesanan dan jumlah tamu.');
    }

    setIsProcessing(true);
    try {
      const res = await api.post('/transactions', {
        property_id: property.id,
        user_id: user.id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        guest_count: guests,
        total_amount: totalPoints,
        payment_method: 'points',
        status: 'confirmed',
        payment_status: 'paid'
      });

      if (res.data.success) {
        // HITUNG POIN BARU DAN UPDATE CONTEXT + localStorage
        const newPoints = user.points - totalPoints;
        updateUserData({ points: newPoints });

        toast.success('Pemesanan berhasil! Poin Anda telah terpotong.');
        navigate('/booking-success', {
          state: {
            transactionId: res.data.data.id,
            propertyName: property.title,
            checkInDate: startDate,
            checkOutDate: endDate,
            totalAmount: totalPoints,
            nights: calculateNights(),
            guests,
            paymentMethod: 'Poin'
          }
        });
      } else {
        throw new Error(res.data.message || 'Gagal proses booking');
      }
    } catch (err) {
      console.error('Booking error:', err);
      const msg = err.response?.data?.message || err.message || 'Pemesanan gagal.';
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!user || !property) {
    return <div className="flex justify-center items-center min-h-screen text-gray-600">Memuat...</div>;
  }


  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Konfirmasi Pemesanan</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Property details and booking details */}
          <div className="lg:w-2/3">
            {/* Property Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{property.title}</h2>
                  <p className="text-gray-600 mb-1">{property.location}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-3">
                      <FiUsers className="inline mr-1" />
                      Max {property.max_guests} tamu
                    </span>
                    <span>
                      <FiDollarSign className="inline mr-1" /> {/* Using dollar sign icon for price */}
                      {formatCurrency(property.price_per_night)} / malam
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Pemesanan</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-1 text-sm">Tanggal Check-in</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date()} // Prevent booking in the past
                    dateFormat="dd/MM/yyyy"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-black bg-white text-black"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formatDate(startDate)}</p>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 text-sm">Tanggal Check-out</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date(startDate ? new Date(startDate).setDate(startDate.getDate() + 1) : new Date())} // End date must be at least 1 day after start date
                    dateFormat="dd/MM/yyyy"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formatDate(endDate)}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1 text-sm">Jumlah Tamu</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                >
                  {/* Ensure options don't exceed max_guests and handle 0 max_guests case */}
                  {property.max_guests > 0 ? (
                    [...Array(property.max_guests)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 > 1 ? 'tamu' : 'tamu'}
                      </option>
                    ))
                  ) : (
                    <option value="1">1 tamu</option> // Default if max_guests is 0 or not set
                  )}
                </select>
              </div>
            </div>

            {/* Removed Payment Details section entirely */}

          </div>

          {/* Right column - Booking summary */}
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Biaya & Poin</h3> {/* Updated title */}

              {/* Display User's Current Points */}
              {user && (
                <div className="mb-4 text-center p-3 bg-blue-50 rounded-md border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Poin Anda Saat Ini:</p>
                  <p className="text-xl font-bold text-blue-700">{formatPoints(user.points)} <span className="text-sm">poin</span></p>
                </div>
              )}


              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {formatCurrency(property.price_per_night)} x {calculateNights()} malam
                  </span>
                  <span className="text-gray-900">{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Biaya layanan (10%)</span> {/* Added percentage */}
                  <span className="text-gray-900">{formatCurrency(calculateServiceFee())}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg"> {/* Increased font size */}
                    <span>Total Poin Dibutuhkan</span> {/* Updated label */}
                    {/* Display total amount as points */}
                    <span className="text-blue-600">{formatPoints(calculateTotalPoints())} <span className="text-sm font-normal">poin</span></span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isProcessing || !user || !property || calculateTotalPoints() <= 0}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </>
                ) : (
                  `Bayar dengan ${formatPoints(calculateTotalPoints())} Poin`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Dengan mengklik tombol di atas, Anda menyetujui Syarat & Ketentuan dan Kebijakan Privasi kami.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;