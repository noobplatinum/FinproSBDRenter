const transactionRepository = require('../repositories/transaction.repo');

const transactionController = {
  async create(req, res) {
    try {
      const newTransaction = await transactionRepository.create(req.body);
      res.status(201).json({
        success: true,
        data: newTransaction
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create transaction',
        error: error.message
      });
    }
  },

  async getAll(req, res) {
    try {
      const transactions = await transactionRepository.findAll();
      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
      });
    } catch (error) {
      console.error('Error getting transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transactions',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const transaction = await transactionRepository.findById(req.params.id);
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('Error getting transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transaction',
        error: error.message
      });
    }
  },

  async getByUserId(req, res) {
    try {
      const transactions = await transactionRepository.findByUserId(req.params.userId);
      
      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
      });
    } catch (error) {
      console.error('Error getting user transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user transactions',
        error: error.message
      });
    }
  },

  async getByPropertyId(req, res) {
    try {
      const transactions = await transactionRepository.findByPropertyId(req.params.propertyId);
      
      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
      });
    } catch (error) {
      console.error('Error getting property transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get property transactions',
        error: error.message
      });
    }
  },

  async getByStatus(req, res) {
    try {
      const transactions = await transactionRepository.findByStatus(req.params.status);
      
      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
      });
    } catch (error) {
      console.error('Error getting transactions by status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transactions by status',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const updatedTransaction = await transactionRepository.update(req.params.id, req.body);
      
      if (!updatedTransaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.status(200).json({
        success: true,
        data: updatedTransaction
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update transaction',
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      const deletedTransaction = await transactionRepository.delete(req.params.id);
      
      if (!deletedTransaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Transaction deleted successfully',
        data: deletedTransaction
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete transaction',
        error: error.message
      });
    }
  }
};

module.exports = transactionController;