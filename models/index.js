// file to define relationships between models

import Property from './Property.js';
import Class from './Class.js';
import Price from './Price.js';
import User from './User.js';
import Message from './Message.js';


// to define relationships between property and price
// Price.hasOne(Property); // or
Property.belongsTo(Price, { foreignKey: 'fkPriceId' });
Property.belongsTo(Class, { foreignKey: 'fkClassId' });
Property.belongsTo(User, { foreignKey: 'fkUserId' });

Message.belongsTo(Property, { foreignKey: 'fkPropertyId' });
Message.belongsTo(User, { foreignKey: 'fkUserId' });






export{
  Property,
  Class,
  Price,
  User,
  Message
}