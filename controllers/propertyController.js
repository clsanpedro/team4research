import { unlink } from 'node:fs/promises'
import { validationResult } from 'express-validator';
import { Price, Class, Property } from '../models/index.js';
import { isVendor } from '../helpers/index.js';

const admin = async ( req, res ) => {

  // Read the query-string

  const { page: currentPage } = req.query;

  const regularXpression = /^[1-9]$/;

  if ( !regularXpression.test( currentPage ) ) {
    return res.redirect('/properties?page=1');
  }

  try{  
    const { id } = req.user;

    // limits and offsets for pagination

    const limit = 10;
    const offset = ( ( currentPage * limit ) - limit );
  
    const [properties, total] = await Promise.all([
      Property.findAll({  
        limit,
        offset,
        where: {
          fkUserId: id
        },
        include: [
          {
            model: Class, as: 'class',
          },
          {
            model: Price, as: 'price',
          }
        ]
      }),
      Property.count({
        where: {
          fkUserId: id
        }
      }),
      currentPage
    ]);



    res.render('properties/admin', {
      page: 'My Properties',
      properties,
      csrfToken: req.csrfToken(),
      totalPages: Math.ceil( total / limit ),
      currentPag: Number(currentPage),
      total,
      offset,
      limit  
    });
  }catch( err ){

    console.log(err)
  }





}

const create = async ( req, res ) => {
  // query the database for price and class model

  const [prices, classes] = await Promise.all([
    Price.findAll(),
    Class.findAll()
  ]);

  res.render('properties/create', {
    page: 'Create a property',
    csrfToken: req.csrfToken(),
    classes,
    prices,
    data:{}
  });  
}

const save = async ( req, res ) => {
  let resultValidation = validationResult( req );
  if ( !resultValidation.isEmpty() ) {
    const [prices, classes] = await Promise.all([
      Price.findAll(),
      Class.findAll()
    ]);
    return res.render('properties/create', {
      page: 'Create a property',
      csrfToken: req.csrfToken(),
      errors: resultValidation.array(),
      classes,
      prices,
      data: req.body      
    });
  }

  // create a new property

  const { title, description, class: fkClassId, price: fkPriceId, rooms, parking, wc, lat, lng, street } = req.body;

  const { id: fkUserId } = req.user;

  try {
    const propertySaved = await Property.create({
      title,
      description,
      rooms,
      parking,
      wc,
      lat,
      lng,
      street,
      fkPriceId,
      fkClassId,
      fkUserId,
      image: ''
    });

    const { id } = propertySaved;

    res.redirect(`/properties/add-image/${id}`);
  } catch (error) {
    console.log(error)
  }
}

const addImage = async ( req, res ) => {

  const { id } = req.params;

  // We validate that the property exists

  const property = await Property.findByPk( id );

  if ( !property ) {
    return res.redirect('/properties');
  }
  
  // We validate that property is not published

  if ( property.published ) {
    return res.redirect('/properties');
  }

  
  // We validate that the property belongs to the user
  if ( req.user.id.toString() !== property.fkUserId.toString() ) {
    return res.redirect('/properties');
  }

  // We validate that the property has no image

  res.render('properties/add-image', {
    page: `Add image: ${property.title}`,
    csrfToken: req.csrfToken(),
    property

  });

}

const saveImage = async ( req, res, next ) => {
  const { id } = req.params;

  // We validate that the property exists

  const property = await Property.findByPk( id );

  if ( !property ) {
    return res.redirect('/properties');
  }
  
  // We validate that property is not published

  if ( property.published ) {
    return res.redirect('/properties');
  }

  
  // We validate that the property belongs to the user
  if ( req.user.id.toString() !== property.fkUserId.toString() ) {
    return res.redirect('/properties');
  }

  try {
    // console.log(req.file);
    // store the image in the server and publish the property
    property.image = req.file.filename;
    property.published = 1;

    await property.save();

    next();


  } catch (error) {
    console.log(error)
    
  }
}

const edit = async ( req, res ) => {
  
  const { id } = req.params;

  // validate that the property exists
  const property = await Property.findByPk( id );

  if(!property){
    return res.redirect('/properties');
  }

  // validate that the property belongs to the user
  if(property.fkUserId.toString() !== req.user.id.toString()){
    return res.redirect('/properties');
  }


  const [prices, classes] = await Promise.all([
    Price.findAll(),
    Class.findAll()
  ]);

  res.render('properties/edit', {    
    page: `Edit property: ${property.title}`,
    csrfToken: req.csrfToken(),
    classes,
    prices,
    data:property
  }); 
}

const saveChanges = async ( req, res ) => {

  // verify validation
  let resultValidation = validationResult( req );
  if ( !resultValidation.isEmpty() ) {
    const [prices, classes] = await Promise.all([
      Price.findAll(),
      Class.findAll()
    ]);
    return res.render('properties/edit', {
      page: 'Edit a property',
      csrfToken: req.csrfToken(),
      errors: resultValidation.array(),
      classes,
      prices,
      data: req.body      
    });
  }


  const { id } = req.params;

  // validate that the property exists
  const property = await Property.findByPk( id );

  if(!property){
    return res.redirect('/properties');
  }

  // validate that the property belongs to the user
  if(property.fkUserId.toString() !== req.user.id.toString()){
    return res.redirect('/properties');
  }

  // update the property

  try {
    const { title, description, class: fkClassId, price: fkPriceId, rooms, parking, wc, lat, lng, street } = req.body;

    property.set({
      title,
      description,
      rooms,
      parking,
      wc,
      lat,
      lng,
      street,
      fkPriceId,
      fkClassId
    });

    await property.save();

    res.redirect('/properties');

  } catch (error) {
    console.log(error)
    
  }
}

const deleteProperty = async ( req, res ) => {
  
  const { id } = req.params;

  // validate that the property exists
  const property = await Property.findByPk( id );

  if(!property){
    return res.redirect('/properties');
  }

  // validate that the property belongs to the user
  if(property.fkUserId.toString() !== req.user.id.toString()){
    return res.redirect('/properties');
  }
  // delete images
  await unlink(`public/uploads/${property.image}`);

  // delete the property
  await property.destroy();
  res.redirect('/properties');
}

const showProperty = async ( req, res ) => {
  const { id } = req.params;

  console.log(req.user);

  const property = await Property.findByPk( id, {
    include : [
      {model: Price, as: 'price'},
      {model: Class, as: 'class'},
    ]
  });

  if(!property){
    return res.redirect('/404');
  }



  res.render('properties/show', {
    property,
    page: property.title,
    csrfToken: req.csrfToken(),
    user: req.user,
    isVendor: isVendor(req.user?.id, property.fkUserId)
    }
  )
}

const sendMessage = async (req, res) => {
  const { id } = req.params;

  const property = await Property.findByPk( id, {
    include : [
      {model: Price, as: 'price'},
      {model: Class, as: 'class'},
    ]
  });

  if(!property){
    return res.redirect('/404');
  }

  // Render errors
  let resultValidation = validationResult( req );
  if ( !resultValidation.isEmpty() ) {
    return res.render('properties/show', {
      property,
      page: property.title,
      csrfToken: req.csrfToken(),
      user: req.user,
      isVendor: isVendor(req.user?.id, property.fkUserId),
      errors: resultValidation.array()
      }
    )
  }

  res.render('properties/show', {
    property,
    page: property.title,
    csrfToken: req.csrfToken(),
    user: req.user,
    isVendor: isVendor(req.user?.id, property.fkUserId)
    }
  )
}

export {
  admin,
  create,
  save,
  addImage,
  saveImage,
  edit,
  saveChanges,
  deleteProperty,
  showProperty,
  sendMessage
}



