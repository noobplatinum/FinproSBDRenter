// src/components/PropertyImages.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PropertyImages = ({ propertyId }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchPropertyImages = async () => {
      try {
        setLoading(true);
        // Gunakan endpoint yang benar sesuai backend
        const response = await axios.get(
          `https://finpro-sbd-renter-backend.vercel.app/api/images/property/${propertyId}`
        );

        if (response.data.success) {
          console.log('Images loaded successfully:', response.data);
          setImages(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to load images');
        }
      } catch (err) {
        console.error('Error loading property images:', err);
        setError('Could not load images. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchPropertyImages();
    }
  }, [propertyId]);

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || images.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center">
        <p className="text-gray-500">{error || 'No images available'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main image display */}
      <div className="w-full h-80 md:h-96 rounded-lg overflow-hidden">
        <img
          src={images[activeImage].url}
          alt={images[activeImage].description || 'Property image'}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnail gallery */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <div
              key={image.id}
              onClick={() => setActiveImage(index)}
              className={`cursor-pointer h-20 w-20 md:h-24 md:w-24 flex-shrink-0 rounded-md overflow-hidden ${
                index === activeImage ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={image.url}
                alt={image.description || `Property image ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {image.is_thumbnail && (
                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyImages;