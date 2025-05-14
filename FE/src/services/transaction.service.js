import api, { handleApiError } from './api';

export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getUserTransactions = async (userId) => {
  try {
    const response = await api.get(`/transactions/user/${userId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getPropertyTransactions = async (propertyId) => {
  try {
    const response = await api.get(`/transactions/property/${propertyId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateTransactionStatus = async (id, status) => {
  try {
    const response = await api.put(`/transactions/${id}`, { status });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createRating = async (ratingData) => {
  try {
    const response = await api.post('/ratings', ratingData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getUserRatings = async (userId) => {
  try {
    const response = await api.get(`/ratings/user/${userId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};