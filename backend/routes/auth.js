const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();

router.post('/usuarios', async (req, res) => {
  const { email, password, rol, lenguaje } = req.body;

  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario en la base de datos
    const result = await pool.query(
      'INSERT INTO usuarios (email, password, rol, lenguaje) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, hashedPassword, rol, lenguaje]
    );

    res.status(201).json({ message: 'Usuario registrado exitosamente', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Verificar si el usuario existe
      const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
      const user = result.rows[0];
  
      if (!user) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }
  
      // Verificar la contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }
  
      // Generar un token JWT
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  });

  
  const jwt = require('jsonwebtoken');

  router.get('/usuarios', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ error: 'Acceso no autorizado' });
    }
  
    try {
      // Verificar y decodificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const email = decoded.email;
  
      // Buscar el usuario por email
      const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
      const user = result.rows[0];
  
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      res.json({ user });
    } catch (error) {
      console.error(error);
      res.status(403).json({ error: 'Token inválido' });
    }
  });
  
  module.exports = router;
  