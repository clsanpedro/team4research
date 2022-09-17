import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const protectRoute = async (req, res, next) => {
  // verify if exist a token

  const { _token } = req.cookies;

  // if exist, verify if token is valid
  if(!_token){
    return res.redirect('/auth/signin');
  }

  try {

    const decoded = jwt.verify(_token, process.env.JWT_SECRET);
    const usr = await User.scope('deletePassword').findByPk(decoded.id);

    // store user in request object
    if(usr){
      req.user = usr;
    }else{
      return res.redirect('/auth/signin');
    }
    return next();
  } catch (error) {
    return res.clearCookie('_token').redirect('/auth/signin');
  }
}


export default protectRoute;