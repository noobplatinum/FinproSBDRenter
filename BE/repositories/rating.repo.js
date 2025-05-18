const db = require('../database/pg.database');

const ratingRepository = {
  async create(ratingData) {
    const { user_id, property_id, rating, comment } = ratingData;
    
    const query = `
      INSERT INTO rating (user_id, property_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [user_id, property_id, rating, comment];
    
    const result = await db.query(query, values);
    
    await this.updatePropertyRatingAvg(property_id);
    
    return result.rows[0];
  },
  
  async findAll() {
    const query = 'SELECT * FROM rating ORDER BY id';
    const result = await db.query(query);
    return result.rows;
  },
  
  async findById(id) {
    const query = 'SELECT * FROM rating WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  },
  
  async findByUserId(userId) {
    const query = 'SELECT * FROM rating WHERE user_id = $1 ORDER BY id';
    const result = await db.query(query, [userId]);
    return result.rows;
  },
  
  async findByPropertyId(propertyId) {
    const query = 'SELECT * FROM rating WHERE property_id = $1 ORDER BY id';
    const result = await db.query(query, [propertyId]);
    return result.rows;
  },
  
  async update(id, ratingData) {
    const { user_id, property_id, rating, comment } = ratingData;
    
    const query = `
      UPDATE rating
      SET user_id = COALESCE($1, user_id),
          property_id = COALESCE($2, property_id),
          rating = COALESCE($3, rating),
          comment = COALESCE($4, comment)
      WHERE id = $5
      RETURNING *
    `;
    
    const values = [user_id, property_id, rating, comment, id];
    
    const result = await db.query(query, values);
    
    if (rating && result.rows[0]) {
      await this.updatePropertyRatingAvg(result.rows[0].property_id);
    }
    
    return result.rows[0];
  },
  
  async delete(id) {
    const getQuery = 'SELECT property_id FROM rating WHERE id = $1';
    const getResult = await db.query(getQuery, [id]);
    const propertyId = getResult.rows[0]?.property_id;
    
    const query = 'DELETE FROM rating WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    
    if (propertyId) {
      await this.updatePropertyRatingAvg(propertyId);
    }
    
    return result.rows[0];
  },
  
  async updatePropertyRatingAvg(propertyId) {
    const query = `
      UPDATE property
      SET rating_avg = (
        SELECT COALESCE(AVG(rating), 0)
        FROM rating
        WHERE property_id = $1
      )
      WHERE id = $1
    `;
    
    await db.query(query, [propertyId]);
  }
};

module.exports = ratingRepository;