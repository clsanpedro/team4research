import { Sequelize } from 'sequelize';
import { Price, Class, Property } from '../models/index.js';

const landing = async ( req, res ) => {

  const [ prices, classes, casas, departamentos ] = await Promise.all([
    Price.findAll({raw: true}),
    Class.findAll({raw: true}),
    Property.findAll({
      limit: 3,
      where: {
        fkClassId: 1
      },
      include: [
        {
          model: Price,
          as: 'price',
        }
      ],
      order: [
        ['createdAt', 'DESC']
      ],
    }),
    Property.findAll({
      limit: 3,
      where: {
        fkClassId: 2
      },
      include: [
        {
          model: Price,
          as: 'price',
        }
      ],
      order: [
        ['createdAt', 'DESC']
      ],
    })
  ]);


  res.render('landing', {
    page: 'Inicio',
    prices,
    classes,
    casas,
    departamentos,
    csrfToken: req.csrfToken()
  })
}


const search = async ( req, res ) => {
  const { word } = req.body;

  if(!word.trim()){
    return res.redirect('back');
  }

  const properties = await Property.findAll({
    where:{
      title: {
        [Sequelize.Op.like]: '%' + word + '%'
      },
    },
    include: [
      { model: Price, as: 'price' }
    ]
  })

  res.render('search', {
    page: `Resultados de la búsqueda: ${word}`,
    properties,
    csrfToken: req.csrfToken()
    
  })


}

const notFound = ( req, res ) => {
  res.render('404', {
    page: '404: Not Found',
    csrfToken: req.csrfToken()
  })
}

const classes = async ( req, res ) => {
  const { id } = req.params;

  // comprovar que categoria existe
  const category = await Class.findByPk(id);
  if(!category) {
    return res.redirect('/404');
  }

  // get properties of the category
  const properties = await Property.findAll({
    where: {
      fkClassId: id
    },
    include: [
      { model: Price, as: 'price' }
    ]
  })

  res.render('category', {
    page: `${category.nameCategory}s en venta`,
    properties,
    csrfToken: req.csrfToken()
  })
}


export {
  landing,
  search,
  notFound,
  classes,
}



