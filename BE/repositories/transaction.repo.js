const db = require('../database/pg.database');
const {pool} = require('../database/pg.database');
const transactionRepository = {
  async create(transactionData) {
  const client = await pool.connect(); 

  try {
    await client.query('BEGIN'); 

    const {
      user_id,
      property_id,
      start_date,
      end_date,
      status = 'pending',
      payment_method = 'points',
      payment_status = 'unpaid',
      total_amount
    } = transactionData;

    const userQuery = await client.query('SELECT points FROM account WHERE id = $1 FOR UPDATE', [user_id]);

    if (userQuery.rows.length === 0) {
      throw new Error('User tidak ditemukan');
    }

    const userPoints = userQuery.rows[0].points;

    if (userPoints < total_amount) {
      throw new Error(`Poin tidak mencukupi. Punya ${userPoints}, perlu ${total_amount}`);
    }

    // 2. Buat transaksi
    const insertTransactionQuery = `
      INSERT INTO transaction (
        user_id, property_id, start_date, end_date, status, 
        payment_method, payment_status, total_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const transactionValues = [
      user_id,
      property_id,
      start_date,
      end_date,
      status,
      payment_method,
      'paid', // karena poin dipotong langsung
      total_amount
    ];

    const transactionResult = await client.query(insertTransactionQuery, transactionValues);

    // 3. Kurangi poin user
    const updateUserPointsQuery = 'UPDATE account SET points = points - $1 WHERE id = $2';
    await client.query(updateUserPointsQuery, [total_amount, user_id]);

    await client.query('COMMIT'); // Sukses semua, commit

    return transactionResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK'); // Ada error, rollback semua
    throw err;
  } finally {
    client.release(); // Lepaskan koneksi kembali ke pool
  }
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