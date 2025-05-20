import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiStar } from 'react-icons/fi';
import axios from 'axios';

const PropertyCard = ({ property }) => {
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Format currency helper
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        const response = await axios.get(
          `https://finpro-sbd-renter-backend.vercel.app/api/images/property/${property.id}/thumbnail`
        );
        
        if (response.data.success && response.data.data) {
          setThumbnail(response.data.data);
        } else {
          // Jika tidak ada thumbnail khusus, coba ambil semua gambar
          const allImagesResponse = await axios.get(
            `https://finpro-sbd-renter-backend.vercel.app/api/images/property/${property.id}`
          );
          
          if (allImagesResponse.data.success && allImagesResponse.data.data.length > 0) {
            setThumbnail(allImagesResponse.data.data[0]);
          }
        }
      } catch (err) {
        console.log('Could not load property thumbnail', err);
      } finally {
        setLoading(false);
      }
    };

    fetchThumbnail();
  }, [property.id]);

  return (
    <Link to={`/properties/${property.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Property Image */}
        <div className="h-48 relative overflow-hidden">
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-full w-full"></div>
          ) : thumbnail ? (
            <img 
              src={thumbnail.url} 
              alt={property.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="bg-gray-100 h-full w-full flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          
          <div className="absolute top-2 left-2">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md">
              {property.category || 'Properti'}
            </span>
          </div>
        </div>
        
        {/* Property Info */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
              {property.title}
            </h3>
            {property.rating_avg && (
              <div className="flex items-center">
                <FiStar className="text-amber-500 mr-1" />
                <span className="text-sm">{parseFloat(property.rating_avg).toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <FiMapPin className="mr-1" />
            <span>{property.location}</span>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <span className="block text-blue-600 font-bold">
                {formatCurrency(property.price_per_night)}
              </span>
              <span className="text-xs text-gray-500">per malam</span>
            </div>
            
            <div className="text-sm text-gray-500">
              {property.bedrooms > 0 && `${property.bedrooms} kamar`}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;