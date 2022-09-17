import { Property, Price, Class } from '../models/index.js'

const properties = async (req, res) => {

  const properties = await Property.findAll({
    include: [  
      {model: Price, as: 'price'},
      {model: Class, as: 'class'},
    ]
  });
  res.json( properties )
};

export { properties };