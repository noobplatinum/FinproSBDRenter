import { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FiCalendar, FiUsers, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const Booking = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [startDate, setStartDate] = useState(
    location.state?.startDate ? new Date(location.state.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState(
    location.state?.endDate ? new Date(location.state.endDate) : new Date(new Date().setDate(new Date().getDate() + 1))
  );
  const [guests, setGuests] = useState(location.state?.guests || 1);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  
  // Fetch property details
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/properties/${id}`);
        if (response.data.success) {
          setProperty(response.data.data);
        } else {
          throw new Error('Failed to fetch property details');
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        setError('Tidak dapat memuat data properti');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  // Calculate number of nights
  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return property?.price_per_night * calculateNights();
  };

  // Calculate service fee (10% of subtotal)
  const calculateServiceFee = () => {
    return calculateSubtotal() * 0.1;
  };

  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateServiceFee();
  };

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
    return date.toLocaleDateString('id-ID', options);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create transaction
      const response = await axios.post('http://localhost:3000/api/transactions', {
        property_id: property.id,
        user_id: user.id,
        checkin_date: startDate.toISOString().split('T')[0],
        checkout_date: endDate.toISOString().split('T')[0],
        guests_count: guests,
        total_amount: calculateTotal(),
        payment_method: paymentMethod,
        status: 'confirmed',
        payment_status: 'paid'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        toast.success('Pembayaran berhasil!');
        navigate('/booking-success', { 
          state: { 
            transactionId: response.data.data.id,
            propertyName: property.title,
            checkInDate: startDate,
            checkOutDate: endDate,
            totalAmount: calculateTotal(),
            nights: calculateNights(),
            guests: guests
          } 
        });
      } else {
        throw new Error('Failed to process transaction');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Pembayaran gagal, silakan coba lagi');
    } finally {
      setIsProcessing(false);
    }
  };

  // Form validation
  const validateForm = () => {
    // For credit card payment
    if (paymentMethod === 'credit_card') {
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error('Nomor kartu kredit harus 16 digit');
        return false;
      }
      
      if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
        toast.error('Format tanggal kedaluwarsa tidak valid (MM/YY)');
        return false;
      }
      
      if (cvv.length < 3) {
        toast.error('CVV harus minimal 3 digit');
        return false;
      }
      
      if (nameOnCard.trim() === '') {
        toast.error('Nama pada kartu harus diisi');
        return false;
      }
    }
    
    return true;
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } 
    return value;
  };

  // Handle card number input
  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };

  // Format expiry date (MM/YY)
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  // Handle expiry date input
  const handleExpiryDateChange = (e) => {
    const formattedValue = formatExpiryDate(e.target.value);
    setExpiryDate(formattedValue);
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

  if (!property) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-gray-500 text-2xl">Properti tidak ditemukan</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Konfirmasi Pemesanan</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Property details and payment form */}
          <div className="lg:w-2/3">
            {/* Property Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden">
                  {property.thumbnail ? (
                    <img 
                      src={property.thumbnail} 
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
                      <FiCalendar className="inline mr-1" />
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
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    minDate={startDate}
                    dateFormat="dd/MM/yyyy"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formatDate(endDate)}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-1 text-sm">Jumlah Tamu</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {[...Array(property.max_guests)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i + 1 > 1 ? 'tamu' : 'tamu'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Payment Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Pembayaran</h3>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Metode Pembayaran</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div 
                    className={`border rounded-lg p-4 flex items-center cursor-pointer ${
                      paymentMethod === 'credit_card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('credit_card')}
                  >
                    <FiCreditCard className={`mr-2 ${paymentMethod === 'credit_card' ? 'text-blue-500' : 'text-gray-500'}`} />
                    <span className={paymentMethod === 'credit_card' ? 'text-blue-700' : 'text-gray-700'}>Kartu Kredit</span>
                  </div>
                  <div 
                    className={`border rounded-lg p-4 flex items-center cursor-pointer ${
                      paymentMethod === 'bank_transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('bank_transfer')}
                  >
                    <FiCreditCard className={`mr-2 ${paymentMethod === 'bank_transfer' ? 'text-blue-500' : 'text-gray-500'}`} />
                    <span className={paymentMethod === 'bank_transfer' ? 'text-blue-700' : 'text-gray-700'}>Transfer Bank</span>
                  </div>
                  <div 
                    className={`border rounded-lg p-4 flex items-center cursor-pointer ${
                      paymentMethod === 'ewallet' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('ewallet')}
                  >
                    <FiCreditCard className={`mr-2 ${paymentMethod === 'ewallet' ? 'text-blue-500' : 'text-gray-500'}`} />
                    <span className={paymentMethod === 'ewallet' ? 'text-blue-700' : 'text-gray-700'}>E-Wallet</span>
                  </div>
                </div>
              </div>
              
              {/* Credit Card Form */}
              {paymentMethod === 'credit_card' && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label htmlFor="cardNumber" className="block text-gray-700 mb-1 text-sm">Nomor Kartu</label>
                    <input
                      type="text"
                      id="cardNumber"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                    />
                  </div>
                  <div>
                    <label htmlFor="cardName" className="block text-gray-700 mb-1 text-sm">Nama pada Kartu</label>
                    <input
                      type="text"
                      id="cardName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nama pemilik kartu"
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry" className="block text-gray-700 mb-1 text-sm">Tanggal Kedaluwarsa</label>
                      <input
                        type="text"
                        id="expiry"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={handleExpiryDateChange}
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-gray-700 mb-1 text-sm">CVV</label>
                      <input
                        type="text"
                        id="cvv"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Bank Transfer Info */}
              {paymentMethod === 'bank_transfer' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <div className="flex items-center mb-3">
                    <FiCheckCircle className="text-green-500 mr-2" />
                    <p className="text-gray-700 font-medium">Lakukan transfer ke rekening berikut:</p>
                  </div>
                  <div className="ml-6 space-y-2">
                    <p className="text-gray-700">Bank: <span className="font-medium">Bank Central Asia (BCA)</span></p>
                    <p className="text-gray-700">Nomor Rekening: <span className="font-medium">1234567890</span></p>
                    <p className="text-gray-700">Atas Nama: <span className="font-medium">PT RenterIn Indonesia</span></p>
                    <p className="text-gray-700">Jumlah: <span className="font-medium">{formatCurrency(calculateTotal())}</span></p>
                  </div>
                  <p className="mt-3 text-sm text-gray-500">
                    Silakan transfer sesuai jumlah di atas. Pembayaran akan dikonfirmasi otomatis dalam 5-10 menit setelah transfer berhasil.
                  </p>
                </div>
              )}
              
              {/* E-Wallet Info */}
              {paymentMethod === 'ewallet' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <div className="flex items-center mb-3">
                    <FiCheckCircle className="text-green-500 mr-2" />
                    <p className="text-gray-700 font-medium">Pilih e-wallet untuk pembayaran:</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <button className="flex items-center justify-center p-3 border border-gray-300 rounded-md hover:bg-gray-100">
                      <img src="https://via.placeholder.com/40x20?text=GoPay" alt="GoPay" className="h-5" />
                      <span className="ml-2 text-gray-700">GoPay</span>
                    </button>
                    <button className="flex items-center justify-center p-3 border border-gray-300 rounded-md hover:bg-gray-100">
                      <img src="https://via.placeholder.com/40x20?text=OVO" alt="OVO" className="h-5" />
                      <span className="ml-2 text-gray-700">OVO</span>
                    </button>
                    <button className="flex items-center justify-center p-3 border border-gray-300 rounded-md hover:bg-gray-100">
                      <img src="https://via.placeholder.com/40x20?text=DANA" alt="DANA" className="h-5" />
                      <span className="ml-2 text-gray-700">DANA</span>
                    </button>
                    <button className="flex items-center justify-center p-3 border border-gray-300 rounded-md hover:bg-gray-100">
                      <img src="https://via.placeholder.com/40x20?text=LinkAja" alt="LinkAja" className="h-5" />
                      <span className="ml-2 text-gray-700">LinkAja</span>
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-gray-500">
                    Anda akan diarahkan ke halaman pembayaran e-wallet yang dipilih setelah mengklik Konfirmasi Pemesanan.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column - Booking summary */}
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pemesanan</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {formatCurrency(property.price_per_night)} x {calculateNights()} malam
                  </span>
                  <span className="text-gray-900">{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Biaya layanan</span>
                  <span className="text-gray-900">{formatCurrency(calculateServiceFee())}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 flex justify-center items-center"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </>
                ) : 'Konfirmasi Pemesanan'}
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