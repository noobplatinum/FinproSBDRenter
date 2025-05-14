const db = require('../database/db');

const facilitiesRepository = {
  async create(facilityData) {
    const { property_id, name, condition } = facilityData;
    
    const query = `
      INSERT INTO facilities (property_id, name, condition)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [property_id, name, condition];
    
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  async findAll() {
    const query = 'SELECT * FROM facilities ORDER BY id';
    const result = await db.query(query);
    return result.rows;
  },
  
  async findById(id) {
    const query = 'SELECT * FROM facilities WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  },
  
  async findByPropertyId(propertyId) {
    const query = 'SELECT * FROM facilities WHERE property_id = $1 ORDER BY id';
    const result = await db.query(query, [propertyId]);
    return result.rows;
  },
  
  async update(id, facilityData) {
    const { property_id, name, condition } = facilityData;
    
    const query = `
      UPDATE facilities
      SET property_id = COALESCE($1, property_id),
          name = COALESCE($2, name),
          condition = COALESCE($3, condition)
      WHERE id = $4
      RETURNING *
    `;
    
    const values = [property_id, name, condition, id];
    
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  async delete(id) {
    const query = 'DELETE FROM facilities WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
};

module.exports = facilitiesRepository;