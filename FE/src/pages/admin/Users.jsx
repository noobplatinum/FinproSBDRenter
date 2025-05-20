import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiEdit, FiTrash2, FiUserPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Fetch users with pagination
      const response = await axios.get(`http://localhost:3000/api/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: currentPage, limit: 10, search: searchTerm }
      });

      if (response.data.success) {
        setUsers(response.data.data);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'An error occurred while fetching users');
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/accounts/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('User deleted successfully');
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
        <Link
          to="/admin/users/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <FiUserPlus className="mr-2" /> Add User
        </Link>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex items-center mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button 
            onClick={() => search()}
            className="ml-2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FiSearch className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* User Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined Date
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center">
    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full overflow-hidden">
      {user.profile_picture ? (
        <img
          className="h-10 w-10 rounded-full object-cover"
          src={user.profile_picture}
          alt={user.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=100`;
          }}
        />
      ) : (
        <img
          className="h-10 w-10 rounded-full object-cover"
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=100`}
          alt={user.name}
        />
      )}
    </div>
    <div className="ml-4">
      <div className="text-sm font-medium text-gray-900">{user.name}</div>
      <div className="text-sm text-gray-500">{user.phone || "No phone"}</div>
    </div>
  </div>
</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.location || "Not specified"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <Link
                      to={`/admin/users/edit/${user.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <FiEdit className="inline" size={18} />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="text-red-600 hover:text-red-900"
                      disabled={user.role === 'admin'}
                    >
                      <FiTrash2 className="inline" size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft />
            </button>
            <div className="px-4 py-1 border-t border-b border-gray-300 bg-white text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronRight />
            </button>
          </nav>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete user "{userToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;