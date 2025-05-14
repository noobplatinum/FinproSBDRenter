const db = require('../database/db');

const transactionRepository = {
  async create(transactionData) {
    const {
      user_id,
      property_id,
      start_date,
      end_date,
      status,
      payment_method,
      payment_status,
      total_amount
    } = transactionData;

    const query = `
      INSERT INTO transaction (
        user_id, property_id, start_date, end_date, status, 
        payment_method, payment_status, total_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      user_id,
      property_id,
      start_date,
      end_date,
      status || 'pending',
      payment_method,
      payment_status || 'unpaid',
      total_amount
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  async findAll() {
    const query = 'SELECT * FROM transaction ORDER BY id';
    const result = await db.query(query);
    return result.rows;
  },

  async findById(id) {
    const query = 'SELECT * FROM transaction WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  async findByUserId(userId) {
    const query = 'SELECT * FROM transaction WHERE user_id = $1 ORDER BY id';
    const result = await db.query(query, [userId]);
    return result.rows;
  },

  async findByPropertyId(propertyId) {
    const query = 'SELECT * FROM transaction WHERE property_id = $1 ORDER BY id';
    const result = await db.query(query, [propertyId]);
    return result.rows;
  },

  async findByStatus(status) {
    const query = 'SELECT * FROM transaction WHERE status = $1 ORDER BY id';
    const result = await db.query(query, [status]);
    return result.rows;
  },

  async update(id, transactionData) {
    const {
      user_id,
      property_id,
      start_date,
      end_date,
      status,
      payment_method,
      payment_status,
      total_amount
    } = transactionData;

    const query = `
      UPDATE transaction
      SET user_id = COALESCE($1, user_id),
          property_id = COALESCE($2, property_id),
          start_date = COALESCE($3, start_date),
          end_date = COALESCE($4, end_date),
          status = COALESCE($5, status),
          payment_method = COALESCE($6, payment_method),
          payment_status = COALESCE($7, payment_status),
          total_amount = COALESCE($8, total_amount)
      WHERE id = $9
      RETURNING *
    `;

    const values = [
      user_id,
      property_id,
      start_date,
      end_date,
      status,
      payment_method,
      payment_status,
      total_amount,
      id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  async delete(id) {
    const query = 'DELETE FROM transaction WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
};

module.exports = transactionRepository;