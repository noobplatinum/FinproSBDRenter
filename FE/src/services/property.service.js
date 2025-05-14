import api, { handleApiError } from './api';

export const getAllProperties = async () => {
  try {
    const response = await api.get('/properties');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAvailableProperties = async () => {
  try {
    const response = await api.get('/properties/available');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getPropertyById = async (id) => {
  try {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getOwnerProperties = async (ownerId) => {
  try {
    const response = await api.get(`/properties/owner/${ownerId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createProperty = async (propertyData) => {
  try {
    const response = await api.post('/properties', propertyData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateProperty = async (id, propertyData) => {
  try {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteProperty = async (id) => {
  try {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getPropertyFacilities = async (propertyId) => {
  try {
    const response = await api.get(`/facilities/property/${propertyId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getPropertyImages = async (propertyId) => {
  try {
    const response = await api.get(`/images/property/${propertyId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getPropertyThumbnail = async (propertyId) => {
  try {
    const response = await api.get(`/images/property/${propertyId}/thumbnail`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getPropertyRatings = async (propertyId) => {
  try {
    const response = await api.get(`/ratings/property/${propertyId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};