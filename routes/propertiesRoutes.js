import express from 'express';
import { body } from 'express-validator';
import { admin, create, save, addImage, saveImage, edit, saveChanges, deleteProperty, showProperty, sendMessage } from '../controllers/propertyController.js';
import protectRoute from '../middleware/protectRoute.js';
import fileUploaded from '../middleware/uploadImage.js';
import identifyUser from '../middleware/identifyUser.js';

const router = express.Router();


router.get('/properties', protectRoute, admin);
router.get('/properties/create', protectRoute, create);
// other option to validate form data. On router 
router.post('/properties/create',
  protectRoute, 
  body('title').notEmpty().withMessage('El título del anuncio es obligatorio'),
  body('description')
    .notEmpty().withMessage('La descripción del anuncio es obligatorio')
    .isLength({ max:200 }).withMessage('La descripción no puede superar los 10 caracteres'),
  body('class').isNumeric().withMessage('Selecciona una categoria'),
  body('price').isNumeric().withMessage('Selecciona un rango de precios'),
  body('rooms').isNumeric().withMessage('Selecciona la cantidad de habitacions'),
  body('parking').isNumeric().withMessage('Selecciona la cantidad de parkings'),
  body('wc').isNumeric().withMessage('Selecciona la cantidad de baños'),
  body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
  save
);

router.get('/properties/add-image/:id', 
            protectRoute,
            addImage
);
router.post('/properties/add-image/:id',
  protectRoute,
  fileUploaded.single('image'),
  saveImage
);

router.get('/properties/edit/:id',
  protectRoute,
  edit
);

router.post('/properties/edit/:id',
  protectRoute, 
  body('title').notEmpty().withMessage('El título del anuncio es obligatorio'),
  body('description')
    .notEmpty().withMessage('La descripción del anuncio es obligatorio')
    .isLength({ max:200 }).withMessage('La descripción no puede superar los 10 caracteres'),
  body('class').isNumeric().withMessage('Selecciona una categoria'),
  body('price').isNumeric().withMessage('Selecciona un rango de precios'),
  body('rooms').isNumeric().withMessage('Selecciona la cantidad de habitacions'),
  body('parking').isNumeric().withMessage('Selecciona la cantidad de parkings'),
  body('wc').isNumeric().withMessage('Selecciona la cantidad de baños'),
  body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
  saveChanges
);

router.post('/properties/delete/:id',
  protectRoute,
  deleteProperty
);

// Public routes
router.get('/property/:id', 
  identifyUser,
  showProperty
);

// Storage messages
router.get('/property/:id', 
  identifyUser,
  body('msg').isLength({min: 10}).withMessage('El mensaje debe tener al menos 10 caracteres'),
  sendMessage,
);


export default router;

