const db = require('../db');

const accountRepository = {
  async create(accountData) {
    const { name, email, password_hash, location, age, gender, role, profile_picture } = accountData;
    
    const query = `
      INSERT INTO account (name, email, password_hash, location, age, gender, role, profile_picture)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [name, email, password_hash, location, age, gender, role || 'user', profile_picture];
    
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  async findAll() {
    const query = 'SELECT * FROM account ORDER BY id';
    const result = await db.query(query);
    return result.rows;
  },
  
  async findById(id) {
    const query = 'SELECT * FROM account WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  },
  
  async findByEmail(email) {
    const query = 'SELECT * FROM account WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  },
  
  async update(id, accountData) {
    const { name, email, password_hash, location, age, gender, role, points, profile_picture } = accountData;
    
    let updateFields = [];
    let values = [];
    let paramCount = 1;
    
    if (name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      values.push(name);
    }
    
    if (email !== undefined) {
      updateFields.push(`email = $${paramCount++}`);
      values.push(email);
    }
    
    if (password_hash !== undefined) {
      updateFields.push(`password_hash = $${paramCount++}`);
      values.push(password_hash);
    }
    
    if (location !== undefined) {
      updateFields.push(`location = $${paramCount++}`);
      values.push(location);
    }
    
    if (age !== undefined) {
      updateFields.push(`age = $${paramCount++}`);
      values.push(age);
    }
    
    if (gender !== undefined) {
      updateFields.push(`gender = $${paramCount++}`);
      values.push(gender);
    }
    
    if (role !== undefined) {
      updateFields.push(`role = $${paramCount++}`);
      values.push(role);
    }
    
    if (points !== undefined) {
      updateFields.push(`points = $${paramCount++}`);
      values.push(points);
    }
    
    if (profile_picture !== undefined) {
      updateFields.push(`profile_picture = $${paramCount++}`);
      values.push(profile_picture);
    }
    
    if (updateFields.length === 0) {
      const currentAccount = await this.findById(id);
      return currentAccount;
    }
    
    values.push(id);
    
    const query = `
      UPDATE account
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  async delete(id) {
    const query = 'DELETE FROM account WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
};

module.exports = accountRepository;