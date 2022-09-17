import express from 'express';
import { classes, landing, notFound, search } from '../controllers/appController.js';

const router = express.Router();


// Landing page
router.get('/', landing);



// Classes page

router.get('/classes/:id', classes);

// 404 page

router.get('/404', notFound);

// Search page
router.post('/search', search);



export default router;