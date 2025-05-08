const accountRepository = require('../repositories/account.repo');
const bcrypt = require('bcryptjs');

const accountController = {
  async create(req, res) {
    try {
      const existingUser = await accountRepository.findByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(req.body.password, salt);

      const userData = {
        ...req.body,
        password_hash,
        password: undefined
      };

      const newAccount = await accountRepository.create(userData);
      
      const { password_hash: hash, ...accountData } = newAccount;
      
      res.status(201).json({
        success: true,
        data: accountData
      });
    } catch (error) {
      console.error('Error creating account:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create account',
        error: error.message
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await accountRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const { password_hash, ...userData } = user;

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: userData
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  },

  async getAll(req, res) {
    try {
      const accounts = await accountRepository.findAll();
      
      const accountsWithoutPasswords = accounts.map(account => {
        const { password_hash, ...accountData } = account;
        return accountData;
      });
      
      res.status(200).json({
        success: true,
        count: accounts.length,
        data: accountsWithoutPasswords
      });
    } catch (error) {
      console.error('Error getting accounts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get accounts',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const account = await accountRepository.findById(req.params.id);
      
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      const { password_hash, ...accountData } = account;

      res.status(200).json({
        success: true,
        data: accountData
      });
    } catch (error) {
      console.error('Error getting account:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get account',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const updateData = {...req.body};
      
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password_hash = await bcrypt.hash(updateData.password, salt);
        delete updateData.password; 
      }

      const updatedAccount = await accountRepository.update(req.params.id, updateData);
      
      if (!updatedAccount) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      const { password_hash, ...accountData } = updatedAccount;

      res.status(200).json({
        success: true,
        data: accountData
      });
    } catch (error) {
      console.error('Error updating account:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update account',
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      const deletedAccount = await accountRepository.delete(req.params.id);
      
      if (!deletedAccount) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      const { password_hash, ...accountData } = deletedAccount;

      res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
        data: accountData
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete account',
        error: error.message
      });
    }
  }
};

module.exports = accountController;