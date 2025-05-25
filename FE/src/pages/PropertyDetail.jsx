import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiMapPin, FiHome, FiUsers, FiUser } from 'react-icons/fi';
import { MdBed, MdShower } from 'react-icons/md';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import PropertyImages from '../components/PropertyImages';

// Reviews Component
const PropertyReviews = ({ propertyId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://finpro-sbd-renter-backend.vercel.app/api/ratings/property/${propertyId}`
        );

        if (response.data.success) {
          // Sort reviews by creation date (newest first)
          const sortedReviews = response.data.data.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          );
          setReviews(sortedReviews);
        } else {
          throw new Error(response.data.message || 'Failed to load reviews');
        }
      } catch (err) {
        console.error('Error loading reviews:', err);
        setError('Gagal memuat ulasan');
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchReviews();
    }
  }, [propertyId]);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Tanggal tidak valid';
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`text-sm ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Ulasan Tamu</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Ulasan Tamu</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-semibold mb-2 sm:mb-0">Ulasan Tamu</h2>
        {reviews.length > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <FiStar className="text-yellow-400 fill-current mr-1" />
            <span className="font-medium">
              {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
            </span>
            <span className="mx-1">•</span>
            <span>{reviews.length} ulasan</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <FiStar className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Belum Ada Ulasan
          </h3>
          <p className="text-gray-500">
            Jadilah yang pertama memberikan ulasan untuk properti ini!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
              <div className="flex items-start space-x-3">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiUser className="text-blue-600 text-lg" />
                  </div>
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <div className="flex items-center space-x-3 mb-1 sm:mb-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {review.username || review.user_name || 'Pengguna'}
                      </h4>
                      {renderStars(review.rating)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(review.created_at)}
                    </div>
                  </div>

                  {review.comment && review.comment.trim() && (
                    <p className="text-gray-700 leading-relaxed mt-2 break-words">
                      "{review.comment}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format currency helper
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://finpro-sbd-renter-backend.vercel.app/api/properties/${id}`
        );

        if (response.data.success) {
          setProperty(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to load property details');
        }
      } catch (err) {
        console.error('Error loading property details:', err);
        setError('Could not load property details. Please try again later.');
        toast.error('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-red-50 p-4 rounded-md">
          <h2 className="text-xl font-bold text-red-800">Error</h2>
          <p className="text-red-600">{error || 'Property not found'}</p>
          <Link to="/properties" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <Link to="/properties" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <FiArrowLeft className="mr-2" /> Back to properties
      </Link>

      <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
      <div className="flex items-center text-gray-600 mb-8">
        <FiMapPin className="mr-1" />
        <span>{property.location}</span>
      </div>

      {/* Property Images Component */}
      <PropertyImages propertyId={id} />

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Description Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Deskripsi</h2>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>

          {/* Reviews Section */}
          <PropertyReviews propertyId={id} />

          {/* Facilities Section */}
          {property.facilities && property.facilities.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
              <h2 className="text-xl font-semibold mb-4">Fasilitas</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.facilities.map((facility, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span className="text-gray-700">{facility.name}</span>
                    {facility.condition && facility.condition !== 'n/a' && (
                      <span className="ml-2 text-sm text-gray-500">({facility.condition})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Harga</h2>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(property.price_per_night)}</p>
            </div>
            <p className="text-gray-500 text-right mb-4">per malam</p>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MdBed className="text-gray-500 mr-2" />
                  <span className="text-gray-700">Kamar Tidur</span>
                </div>
                <span className='text-gray-700'>{property.bedrooms || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MdShower className="text-gray-500 mr-2" />
                  <span className="text-gray-700">Kamar Mandi</span>
                </div>
               <span className='text-gray-700'>{property.bathrooms || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiUsers className="text-gray-500 mr-2" />
                  <span className="text-gray-700">Maksimal Tamu</span>
                </div>
                <span className='text-gray-700'>{property.max_guests || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiHome className="text-gray-500 mr-2" />
                  <span className="text-gray-700">Kategori</span>
                </div>
                <span className="capitalize text-gray-700">{property.category || 'Properti'}</span>
              </div>
            </div>

            <Link
              to={`/booking/${property.id}`}
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg mt-6 transition-colors"
            >
              Pesan Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;