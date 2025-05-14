const db = require('../database/db');
const cloudinary = require('../utils/cloudinary.util');

const imageRepository = {
  async create(imageData) {
    const { property_id, url, public_id, description, is_thumbnail } = imageData;
    
    const query = `
      INSERT INTO image (property_id, url, public_id, description, is_thumbnail)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [property_id, url, public_id, description, is_thumbnail || false];
    
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  async findAll() {
    const query = 'SELECT * FROM image ORDER BY id';
    const result = await db.query(query);
    return result.rows;
  },
  
  async findById(id) {
    const query = 'SELECT * FROM image WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  },
  
  async findByPropertyId(propertyId) {
    const query = 'SELECT * FROM image WHERE property_id = $1 ORDER BY id';
    const result = await db.query(query, [propertyId]);
    return result.rows;
  },
  
  async findThumbnailByPropertyId(propertyId) {
    const query = 'SELECT * FROM image WHERE property_id = $1 AND is_thumbnail = true LIMIT 1';
    const result = await db.query(query, [propertyId]);
    return result.rows[0];
  },
  
  async update(id, imageData) {
    const { property_id, url, public_id, description, is_thumbnail } = imageData;
    
    const query = `
      UPDATE image
      SET property_id = COALESCE($1, property_id),
          url = COALESCE($2, url),
          public_id = COALESCE($3, public_id),
          description = COALESCE($4, description),
          is_thumbnail = COALESCE($5, is_thumbnail)
      WHERE id = $6
      RETURNING *
    `;
    
    const values = [property_id, url, public_id, description, is_thumbnail, id];
    
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  async setAsThumbnail(id) {
    const getQuery = 'SELECT property_id FROM image WHERE id = $1';
    const getResult = await db.query(getQuery, [id]);
    const propertyId = getResult.rows[0]?.property_id;
    
    if (!propertyId) {
      return null;
    }
    
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      await client.query(
        'UPDATE image SET is_thumbnail = false WHERE property_id = $1',
        [propertyId]
      );
      
      const updateResult = await client.query(
        'UPDATE image SET is_thumbnail = true WHERE id = $1 RETURNING *',
        [id]
      );
      
      await client.query('COMMIT');
      
      return updateResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  
  async delete(id) {
    const getQuery = 'SELECT public_id FROM image WHERE id = $1';
    const getResult = await db.query(getQuery, [id]);
    const publicId = getResult.rows[0]?.public_id;
    
    const query = 'DELETE FROM image WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    
    if (publicId) {
      await cloudinary.deleteImage(publicId);
    }
    
    return result.rows[0];
  }
};

module.exports = imageRepository;