import jwt from 'jsonwebtoken';
import User from '../models/User.js';


const identifyUser = async (req, res, next) => {
  // Indentify token
  const { _token } = await req.cookies;
  if(!_token){
    req.user = null;
    return next();
  }
  
  // validate token

  try {
    const decoded = jwt.verify(_token, process.env.JWT_SECRET);
    const usr = await User.scope('deletePassword').findByPk(decoded.id);

    // store user in request object
    if(usr){
      req.user = usr;
    }
    return next();    
  } catch (error) {
    console.log(error);
    return res.clearCookie('_token').redirect('/auth/signin');
  }


}

export default identifyUser;