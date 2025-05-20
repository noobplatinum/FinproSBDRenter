import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiEye, FiChevronDown } from 'react-icons/fi';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const paymentStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    refunded: 'bg-gray-100 text-gray-800',
    failed: 'bg-red-100 text-red-800',
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('IDR', 'Rp');
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/transactions');
        if (response.data.success) {
          // Add property and user details to transactions
          const transactionsWithDetails = await Promise.all(
            response.data.data.map(async (transaction) => {
              try {
                // Get property details
                const propertyResponse = await axios.get(`http://localhost:3000/api/properties/${transaction.property_id}`);
                // Get user details
                const userResponse = await axios.get(`http://localhost:3000/api/accounts/${transaction.user_id}`);

                return {
                  ...transaction,
                  property: propertyResponse.data.data,
                  user: userResponse.data.data
                };
              } catch (err) {
                console.error('Error fetching details:', err);
                return transaction;
              }
            })
          );

          setTransactions(transactionsWithDetails);
        }
      } catch (err) {
        setError('Failed to fetch transactions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filter and search transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch =
      (transaction.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(transaction.id).includes(searchTerm));

    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const totalAmount = filteredTransactions.reduce((sum, transaction) => {
    if (transaction.payment_status === 'paid') {
      const amount = parseFloat(transaction.total_amount) || 0;
      return sum + amount;
    }
    return sum;
  }, 0);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Transaction Management</h1>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Transactions: {filteredTransactions.length}</p>
          <p className="text-lg font-semibold text-green-600">Total Revenue: {formatCurrency(totalAmount)}</p>        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="md:w-2/3">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by property name, tenant, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="md:w-1/3">
          <div className="relative w-60">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <FiChevronDown className="text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTransactions.length > 0 ? (
                currentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.property?.title || 'Unknown Property'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {transaction.property_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.user?.name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {transaction.user_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(transaction.start_date)} - {formatDate(transaction.end_date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.ceil((new Date(transaction.end_date) - new Date(transaction.start_date)) / (1000 * 60 * 60 * 24))} nights
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rp {transaction.total_amount?.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[transaction.status] || 'bg-gray-100 text-gray-800'}`}>
                        {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1) || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusColors[transaction.payment_status] || 'bg-gray-100 text-gray-800'}`}>
                        {transaction.payment_status?.charAt(0).toUpperCase() + transaction.payment_status?.slice(1) || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/admin/transactions/${transaction.id}`} className="text-blue-600 hover:text-blue-900">
                        <FiEye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-5 flex justify-center">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            Previous
          </button>

          {/* Page numbers */}
          {Array.from({ length: Math.ceil(filteredTransactions.length / itemsPerPage) }).map((_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === index + 1 ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(filteredTransactions.length / itemsPerPage)}
            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === Math.ceil(filteredTransactions.length / itemsPerPage)
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Transactions;