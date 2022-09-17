import { exit } from 'node:process';
import db from '../config/db.js';
import classes from './classes.js';
import prices from './prices.js';
import users from './users.js';
import { Class, Price, User } from '../models/index.js';

const importData = async () => { 

  try{
    // to authenticate
    await db.authenticate();

    // to generate columns
    await db.sync();

    // to insert data
    // if they depend each other, insert them in the right order
    // await Class.bulkCreate(classes);
    // await Price.bulkCreate(prices);
    
    // if they don't depend each other, insert them in the right order
    await Promise.all([
      Class.bulkCreate(classes),
      Price.bulkCreate(prices),
      User.bulkCreate(users)
    ]);
    
    console.log('Data imported successfully');
    exit(0);

  }catch ( error ) {
    console.log(error);
    exit(1);
  }  
}

const deleteData = async () => {
  try {
    // await Promise.all([
    //   Class.destroy( { where: {}, trucate: true } ),
    //   Price.destroy( { where: {}, trucate: true } )
    // ]);

    // alternative form to delete all data, but conservating table structure
    await db.sync({ force: true });
    console.log('Data deleted successfully');
    exit(0);
  } catch (error) {
    console.log(error);
    exit(1);    
  }
}

if ( process.argv[[2]] === '-i' ) {
  importData();
}

if ( process.argv[[2]] === '-e' ) {
  deleteData();
}
