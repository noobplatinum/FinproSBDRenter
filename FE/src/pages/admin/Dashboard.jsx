import { useState, useEffect } from 'react';
import {
  FiUsers,
  FiHome,
  FiDollarSign,
  FiStar,
  FiShoppingBag,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiPlus
} from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { Link } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalRevenue: 0,
    averageRating: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const calculateGrowthRate = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };
  const [monthlyRevenue, setMonthlyRevenue] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue (Juta Rp)',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      }
    ]
  });

  const [propertyTypes, setPropertyTypes] = useState({
    labels: ['Apartment', 'House', 'Villa', 'Kost', 'Cottage'],
    datasets: [
      {
        label: 'Property Types',
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderWidth: 1,
      }
    ]
  });

  const [popularPropertiesChart, setPopularPropertiesChart] = useState({
    labels: [],
    datasets: [
      {
        label: 'Bookings',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 2,
      }
    ]
  });
  const [yearOverYearGrowth, setYearOverYearGrowth] = useState(0);
  const [bookingStats, setBookingStats] = useState({
    totalBookings: 0,
    totalBookingsChange: 0,
    occupancyRate: 0,
    occupancyRateChange: 0,
    avgBookingValue: 0,
    avgBookingValueChange: 0,
    avgLengthOfStay: 0,
    avgLengthOfStayChange: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard data...');

        // Verifikasi token admin
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token not found');
        }

        try {
          // Mengambil data menggunakan endpoint yang tersedia
          const [accountsRes, propertiesRes, transactionsRes] = await Promise.all([
            axios.get('http://localhost:3000/api/accounts', {
              headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get('http://localhost:3000/api/properties', {
              headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get('http://localhost:3000/api/transactions', {
              headers: { Authorization: `Bearer ${token}` }
            })
          ]);

          // Data untuk kartu statistik
          const accounts = accountsRes.data.data || [];
          const properties = propertiesRes.data.data || [];
          const transactions = transactionsRes.data.data || [];

          // Hitung statistik dasar
          const totalUsers = accounts.length;
          const totalProperties = properties.length;

          // Hitung total pendapatan dari transaksi
          const completedTransactions = transactions.filter(t =>
            t.status === 'completed' || t.payment_status === 'paid'
          );

          const totalRevenue = completedTransactions.reduce(
            (sum, t) => sum + (t.total_amount || 0),
            0
          );

          // Hitung rating rata-rata
          const propertiesWithRating = properties.filter(p => p.rating_avg);
          const averageRating = propertiesWithRating.length > 0
            ? propertiesWithRating.reduce((sum, p) => sum + parseFloat(p.rating_avg || 0), 0) / propertiesWithRating.length
            : 0;

          // Set statistik dasar
          setStats({
            totalUsers,
            totalProperties,
            totalRevenue,
            averageRating: parseFloat(averageRating.toFixed(1))
          });

          // Transaksi terbaru (5 teratas)
          const sortedTransactions = [...transactions]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
          const calculateYearOverYearGrowth = () => {
            const currentYear = new Date().getFullYear();
            const lastYear = currentYear - 1;

            const currentYearTransactions = transactions.filter(tx => {
              return new Date(tx.created_at).getFullYear() === currentYear &&
                (tx.status === 'completed' || tx.payment_status === 'paid');
            });

            const lastYearTransactions = transactions.filter(tx => {
              return new Date(tx.created_at).getFullYear() === lastYear &&
                (tx.status === 'completed' || tx.payment_status === 'paid');
            });

            const currentYearRevenue = currentYearTransactions.reduce((sum, tx) => sum + (tx.total_amount || 0), 0);
            const lastYearRevenue = lastYearTransactions.reduce((sum, tx) => sum + (tx.total_amount || 0), 0);

            const yoyGrowth = calculateGrowthRate(currentYearRevenue, lastYearRevenue);
            setYearOverYearGrowth(parseFloat(yoyGrowth.toFixed(1)));
          };

          // Call the function
          calculateYearOverYearGrowth();
          // Siapkan data untuk transaksi terbaru
          const recentTxs = await Promise.all(
            sortedTransactions.map(async (tx) => {
              let propertyName = `Property #${tx.property_id}`;
              let tenantName = `User #${tx.user_id}`;

              try {
                // Coba ambil detail properti
                if (tx.property_id) {
                  const propertyRes = await axios.get(`http://localhost:3000/api/properties/${tx.property_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  if (propertyRes.data.success && propertyRes.data.data) {
                    propertyName = propertyRes.data.data.title;
                  }
                }

                // Coba ambil detail user
                if (tx.user_id) {
                  const userRes = await axios.get(`http://localhost:3000/api/accounts/${tx.user_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  if (userRes.data.success && userRes.data.data) {
                    tenantName = userRes.data.data.name;
                  }
                }
              } catch (detailError) {
                console.error('Error fetching details:', detailError);
              }

              return {
                id: tx.id,
                property: propertyName,
                tenant: tenantName,
                amount: tx.total_amount || 0,
                date: tx.created_at,
                status: tx.status || tx.payment_status || 'pending'
              };
            })
          );

          setRecentTransactions(recentTxs);

          // Hitung data booking
          const totalBookings = transactions.length;
          const paidBookings = transactions.filter(t =>
            t.status === 'completed' || t.payment_status === 'paid'
          ).length;

          // Occupancy rate (hanya untuk demo)
          const occupancyRate = (paidBookings / Math.max(1, totalProperties)) * 100;

          // Nilai booking rata-rata
          const avgBookingValue = completedTransactions.length > 0
            ? completedTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0) / completedTransactions.length
            : 0;

          // Hitung durasi rata-rata (dalam hari) berdasarkan checkin/checkout
          let totalNights = 0;
          let bookingsWithDates = 0;

          transactions.forEach(tx => {
            if (tx.checkin_date && tx.checkout_date) {
              const checkin = new Date(tx.checkin_date);
              const checkout = new Date(tx.checkout_date);
              if (checkout > checkin) {
                const diffTime = Math.abs(checkout - checkin);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                totalNights += diffDays;
                bookingsWithDates++;
              }
            }
          });

          const avgLengthOfStay = bookingsWithDates > 0 ? totalNights / bookingsWithDates : 3; // Default: 3 hari

          // Set statistik booking
          const currentDate = new Date();
          const previousMonthDate = new Date();
          previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);

          // Filter transactions for current month and previous month
          const currentMonthTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.created_at);
            return txDate.getMonth() === currentDate.getMonth() &&
              txDate.getFullYear() === currentDate.getFullYear();
          });

          const previousMonthTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.created_at);
            return txDate.getMonth() === previousMonthDate.getMonth() &&
              txDate.getFullYear() === previousMonthDate.getFullYear();
          });

          // Calculate booking metrics
          const currentMonthBookings = currentMonthTransactions.length;
          const previousMonthBookings = previousMonthTransactions.length;
          const bookingsChange = calculateGrowthRate(currentMonthBookings, previousMonthBookings);

          // Calculate occupancy rates
          const currentOccupancy = currentMonthTransactions.length / Math.max(1, totalProperties) * 100;
          const previousOccupancy = previousMonthTransactions.length / Math.max(1, totalProperties) * 100;
          const occupancyChange = calculateGrowthRate(currentOccupancy, previousOccupancy);

          // Calculate average booking values
          const currentCompletedTxs = currentMonthTransactions.filter(t =>
            t.status === 'completed' || t.payment_status === 'paid'
          );
          const previousCompletedTxs = previousMonthTransactions.filter(t =>
            t.status === 'completed' || t.payment_status === 'paid'
          );

          const currentAvgValue = currentCompletedTxs.length > 0
            ? currentCompletedTxs.reduce((sum, t) => sum + (t.total_amount || 0), 0) / currentCompletedTxs.length
            : 0;
          const previousAvgValue = previousCompletedTxs.length > 0
            ? previousCompletedTxs.reduce((sum, t) => sum + (t.total_amount || 0), 0) / previousCompletedTxs.length
            : 0;
          const valueChange = calculateGrowthRate(currentAvgValue, previousAvgValue);

          // Calculate average length of stay
          let currentTotalNights = 0, currentBookingsWithDates = 0;
          let previousTotalNights = 0, previousBookingsWithDates = 0;

          currentMonthTransactions.forEach(tx => {
            if (tx.checkin_date && tx.checkout_date) {
              const checkin = new Date(tx.checkin_date);
              const checkout = new Date(tx.checkout_date);
              if (checkout > checkin) {
                const diffTime = Math.abs(checkout - checkin);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                currentTotalNights += diffDays;
                currentBookingsWithDates++;
              }
            }
          });

          previousMonthTransactions.forEach(tx => {
            if (tx.checkin_date && tx.checkout_date) {
              const checkin = new Date(tx.checkin_date);
              const checkout = new Date(tx.checkout_date);
              if (checkout > checkin) {
                const diffTime = Math.abs(checkout - checkin);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                previousTotalNights += diffDays;
                previousBookingsWithDates++;
              }
            }
          });

          const currentAvgStay = currentBookingsWithDates > 0 ? currentTotalNights / currentBookingsWithDates : 0;
          const previousAvgStay = previousBookingsWithDates > 0 ? previousTotalNights / previousBookingsWithDates : 0;
          const stayChange = calculateGrowthRate(currentAvgStay, previousAvgStay);

          // Update booking stats with real calculated values
          setBookingStats({
            totalBookings,
            totalBookingsChange: parseFloat(bookingsChange.toFixed(1)),
            occupancyRate: parseFloat(occupancyRate.toFixed(1)),
            occupancyRateChange: parseFloat(occupancyChange.toFixed(1)),
            avgBookingValue,
            avgBookingValueChange: parseFloat(valueChange.toFixed(1)),
            avgLengthOfStay,
            avgLengthOfStayChange: parseFloat(stayChange.toFixed(1))
          });

          // Generate data pendapatan bulanan berdasarkan transaksi yang ada
          const monthlyRevenueData = Array(12).fill(0);

          completedTransactions.forEach(tx => {
            if (tx.created_at) {
              const month = new Date(tx.created_at).getMonth();
              monthlyRevenueData[month] += (tx.total_amount || 0);
            }
          });

          setMonthlyRevenue({
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
              label: 'Revenue (Juta Rp)',
              data: monthlyRevenueData.map(value => value / 1000000), // Konversi ke juta
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              borderColor: 'rgb(59, 130, 246)',
              borderWidth: 2
            }]
          });

          // Hitung distribusi tipe properti
          const typeCount = {};
          properties.forEach(p => {
            const type = p.type || 'Other';
            typeCount[type] = (typeCount[type] || 0) + 1;
          });

          const propertyTypeLabels = Object.keys(typeCount);
          const propertyTypeData = propertyTypeLabels.map(type => typeCount[type]);

          setPropertyTypes({
            labels: propertyTypeLabels,
            datasets: [{
              label: 'Property Types',
              data: propertyTypeData,
              backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
              ].slice(0, propertyTypeLabels.length),
              borderWidth: 1,
            }]
          });

          // Hitung properti paling populer
          // Menghitung jumlah booking per properti
          const propertyBookingCount = {};
          transactions.forEach(tx => {
            if (tx.property_id) {
              propertyBookingCount[tx.property_id] = (propertyBookingCount[tx.property_id] || 0) + 1;
            }
          });

          // Mendapatkan properti dengan booking terbanyak
          const popularPropertyIds = Object.keys(propertyBookingCount)
            .sort((a, b) => propertyBookingCount[b] - propertyBookingCount[a])
            .slice(0, 5);

          const popularPropertiesData = await Promise.all(
            popularPropertyIds.map(async (id) => {
              try {
                const propertyRes = await axios.get(`http://localhost:3000/api/properties/${id}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });

                if (propertyRes.data.success && propertyRes.data.data) {
                  return {
                    id,
                    title: propertyRes.data.data.title || `Property #${id}`,
                    bookingsCount: propertyBookingCount[id]
                  };
                }
              } catch (error) {
                console.error(`Error fetching property ${id}:`, error);
              }

              return {
                id,
                title: `Property #${id}`,
                bookingsCount: propertyBookingCount[id]
              };
            })
          );

          setPopularPropertiesChart({
            labels: popularPropertiesData.map(p => p.title),
            datasets: [{
              label: 'Bookings',
              data: popularPropertiesData.map(p => p.bookingsCount),
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgb(75, 192, 192)',
              borderWidth: 2,
            }]
          });

        } catch (apiError) {
          console.error('API call failed:', apiError);
          throw new Error(`API error: ${apiError.message}`);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setError(error.message || "Failed to load dashboard data");

        // Fallback ke data dummy jika API gagal
        useDummyData();
      } finally {
        setLoading(false);
      }
    };

    // Helper function untuk data dummy
    const useDummyData = () => {
      console.log("Using fallback dummy data");

      // Data dummy yang sudah ada
      setStats({
        totalUsers: 1245,
        totalProperties: 347,
        totalRevenue: 278500000,
        averageRating: 4.7,
      });

      setRecentTransactions([
        { id: 1, property: 'Villa Bali Sunset', tenant: 'John Doe', amount: 5500000, date: '2023-05-01', status: 'completed' },
        { id: 2, property: 'Modern Apartment Jakarta', tenant: 'Sarah Johnson', amount: 12000000, date: '2023-04-28', status: 'ongoing' },
        { id: 3, property: 'Cozy Studio Bandung', tenant: 'Michael Chen', amount: 4000000, date: '2023-04-27', status: 'completed' },
        { id: 4, property: 'Family House Surabaya', tenant: 'Rina Wijaya', amount: 8500000, date: '2023-04-25', status: 'completed' },
        { id: 5, property: 'Mountain View Villa', tenant: 'David Wilson', amount: 2500000, date: '2023-04-25', status: 'pending' },
      ]);

      setMonthlyRevenue({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Revenue (Juta Rp)',
          data: [15.2, 18.5, 22.1, 25.8, 30.2, 28.5, 33.1, 35.8, 32.9, 37.5, 40.2, 43.8],
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2
        }]
      });

      setPropertyTypes({
        labels: ['Apartment', 'House', 'Villa', 'Kost', 'Cottage'],
        datasets: [{
          label: 'Property Types',
          data: [145, 87, 64, 32, 19],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
          ],
          borderWidth: 1,
        }]
      });

      setPopularPropertiesChart({
        labels: ['Villa Bali Sunset', 'Modern Apartment Jakarta', 'Cozy Studio Bandung', 'Family House Surabaya', 'Mountain View Villa'],
        datasets: [{
          label: 'Bookings',
          data: [32, 28, 21, 18, 15],
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 2,
        }]
      });

      setBookingStats({
        totalBookings: 1248,
        totalBookingsChange: 18.2,
        occupancyRate: 78.5,
        occupancyRateChange: 5.4,
        avgBookingValue: 7250000,
        avgBookingValueChange: -2.3,
        avgLengthOfStay: 4.2,
        avgLengthOfStayChange: 0.8
      });
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-600 text-white px-3 py-1 rounded"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <Link
          to="/admin/properties/add"
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <FiPlus className="mr-2" /> Tambah Properti
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users Card */}
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full">
            <FiUsers size={24} className="text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <h3 className="text-xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</h3>
          </div>
        </div>

        {/* Total Properties Card */}
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
          <div className="bg-green-100 p-3 rounded-full">
            <FiHome size={24} className="text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Properties</p>
            <h3 className="text-xl font-bold text-gray-900">{stats.totalProperties.toLocaleString()}</h3>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
          <div className="bg-purple-100 p-3 rounded-full">
            <FiDollarSign size={24} className="text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <h3 className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</h3>
          </div>
        </div>

        {/* Average Rating Card */}
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
          <div className="bg-amber-100 p-3 rounded-full">
            <FiStar size={24} className="text-amber-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Average Rating</p>
            <h3 className="text-xl font-bold text-gray-900">{stats.averageRating} <span className="text-amber-500">★</span></h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Monthly Revenue</h2>
            <div className={`flex items-center ${yearOverYearGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {yearOverYearGrowth >= 0 ? (
                <FiTrendingUp size={18} className="mr-1" />
              ) : (
                <FiTrendingDown size={18} className="mr-1" />
              )}
              <span className="text-sm font-medium">
                {yearOverYearGrowth > 0 ? '+' : ''}{yearOverYearGrowth}% vs last year
              </span>
            </div>
          </div>
          <div className="h-80">
            <Line
              data={monthlyRevenue}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Property Types Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Property Types Distribution</h2>
          <div className="flex justify-center h-80">
            <Doughnut
              data={propertyTypes}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Popular Properties Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Most Booked Properties</h2>
          <div className="h-80">
            <Bar
              data={popularPropertiesChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
            <Link to="/admin/transactions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.property}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {transaction.tenant}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Total Bookings</h3>
            <div className="bg-green-100 p-2 rounded-full">
              <FiShoppingBag size={18} className="text-green-600" />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-bold text-gray-900">{bookingStats.totalBookings.toLocaleString()}</span>
            {bookingStats.totalBookingsChange !== 0 && (
              <span className={`${bookingStats.totalBookingsChange > 0 ? 'text-green-600' : 'text-red-600'} text-sm font-semibold ml-2`}>
                {bookingStats.totalBookingsChange > 0 ? '+' : ''}{bookingStats.totalBookingsChange.toFixed(1)}%
              </span>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Compared to last month
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Occupancy Rate</h3>
            <div className="bg-purple-100 p-2 rounded-full">
              <FiHome size={18} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-bold text-gray-900">{bookingStats.occupancyRate.toFixed(1)}%</span>
            {bookingStats.occupancyRateChange !== 0 && (
              <span className={`${bookingStats.occupancyRateChange > 0 ? 'text-green-600' : 'text-red-600'} text-sm font-semibold ml-2`}>
                {bookingStats.occupancyRateChange > 0 ? '+' : ''}{bookingStats.occupancyRateChange.toFixed(1)}%
              </span>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Compared to last month
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Avg. Booking Value</h3>
            <div className="bg-blue-100 p-2 rounded-full">
              <FiDollarSign size={18} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(bookingStats.avgBookingValue)}</span>
            {bookingStats.avgBookingValueChange !== 0 && (
              <span className={`${bookingStats.avgBookingValueChange > 0 ? 'text-green-600' : 'text-red-600'} text-sm font-semibold ml-2`}>
                {bookingStats.avgBookingValueChange > 0 ? '+' : ''}{bookingStats.avgBookingValueChange.toFixed(1)}%
              </span>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Compared to last month
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Avg. Length of Stay</h3>
            <div className="bg-amber-100 p-2 rounded-full">
              <FiCalendar size={18} className="text-amber-600" />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-bold text-gray-900">{bookingStats.avgLengthOfStay.toFixed(1)}</span>
            <span className="text-sm font-medium ml-1">nights</span>
            {bookingStats.avgLengthOfStayChange !== 0 && (
              <span className={`${bookingStats.avgLengthOfStayChange > 0 ? 'text-green-600' : 'text-red-600'} text-sm font-semibold ml-2`}>
                {bookingStats.avgLengthOfStayChange > 0 ? '+' : ''}{bookingStats.avgLengthOfStayChange.toFixed(1)}
              </span>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Compared to last month
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;