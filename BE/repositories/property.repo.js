const db = require('../database/pg.database');

const propertyRepository = {
  async create(propertyData) {
    const {
      title,
      description,
      location,
      size,
      price_per_night,
      category,
      owner_id,
      is_available,
      bedrooms,
      bathrooms,
      max_guests
    } = propertyData;

    const query = `
      INSERT INTO property (
        title, description, location, size, price_per_night,
        category, owner_id, is_available,
        bedrooms, bathrooms, max_guests -- Tambahkan kolom baru di sini
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) -- Tambahkan placeholder baru
      RETURNING *
    `;

    const values = [
      title,
      description,
      location,
      size,
      price_per_night,
      category,
      owner_id,
      is_available !== undefined ? is_available : true, 
      bedrooms,
      bathrooms,
      max_guests
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  async findAll() {
    const query = 'SELECT * FROM property ORDER BY id';
    const result = await db.query(query);
    return result.rows;
  },

  async findById(id) {
    const query = 'SELECT * FROM property WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  async findByOwnerId(ownerId) {
    const query = 'SELECT * FROM property WHERE owner_id = $1 ORDER BY id';
    const result = await db.query(query, [ownerId]);
    return result.rows;
  },

  async findAvailable() {
    const query = 'SELECT * FROM property WHERE is_available = true ORDER BY id';
    const result = await db.query(query);
    return result.rows;
  },

  async update(id, propertyData) {
    const {
      title,
      description,
      location,
      size,
      price_per_night,
      rating_avg,
      category,
      owner_id,
      is_available,
      bedrooms,   
      bathrooms, 
      max_guests    
    } = propertyData;

    const query = `
      UPDATE property
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        location = COALESCE($3, location),
        size = COALESCE($4, size),
        price_per_night = COALESCE($5, price_per_night),
        rating_avg = COALESCE($6, rating_avg),
        category = COALESCE($7, category),
        owner_id = COALESCE($8, owner_id),
        is_available = COALESCE($9, is_available),
        -- --- UPDATE KOLOM BARU ---
        bedrooms = COALESCE($10, bedrooms),    -- Tambahkan update bedrooms
        bathrooms = COALESCE($11, bathrooms),  -- Tambahkan update bathrooms
        max_guests = COALESCE($12, max_guests) -- Tambahkan update max_guests
        -- --- AKHIR UPDATE KOLOM BARU ---
      WHERE id = $13 -- Ubah index placeholder untuk ID
      RETURNING *
    `;

    const values = [
      title,
      description,
      location,
      size,
      price_per_night,
      rating_avg,
      category,
      owner_id,
      is_available,
      bedrooms,
      bathrooms,
      max_guests,
      id 
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  async delete(id) {
    const query = 'DELETE FROM property WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
};

module.exports = propertyRepository;