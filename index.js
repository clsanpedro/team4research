// const express = require('express'); // CommonJs

import express from 'express'; // ECMA Script Modules
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
import propertiesRoutes from './routes/propertiesRoutes.js';
import appRoutes from './routes/appRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import db from './config/db.js';

// creamos la app
const app = express ();


// habilitar lectura datos formularios
app.use( express.urlencoded( { extended: true } ) );

// habilitar parseo de cookies
app.use( cookieParser() );

// habilitar csrf
app.use( csrf( { cookie: true } ) );

// conexión a la base de d⚛ 
try {
  await db.authenticate();
  db.sync();
  console.log('Correct connection to de database')
} catch (error) {
  console.log(error)
}

// Habilitamos pug

app.set( 'view engine', 'pug' );
app.set( 'views', './views' );

// carpeta pública

app.use( express.static( 'public' ) );

// routing
app.use('/', appRoutes);
app.use('/auth', userRoutes);
app.use('/', propertiesRoutes); //app.get busca la ruta exacta. app.use toma todas las rutas.
app.use('/api', apiRoutes);



// definimos el puerto

const port = process.env.PORT || 3000;

app.listen( port , () => {
  console.log(`server is running on port ${port}`);
})