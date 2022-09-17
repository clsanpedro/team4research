
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateJWT, generateId } from '../helpers/tokens.js';
import { emailEnrole, emailForgotPassword } from '../helpers/emails.js';

const formSignIn = ( req, res ) => {
  res.render ( 'auth/signin', {
    page: 'Sign In',
    csrfToken: req.csrfToken()
  });
}

const authenticate = async ( req, res ) => {

  await check('email').isEmail().withMessage('El campo email es obligatorio').run(req);
  await check('password').notEmpty().withMessage('El password es obligatorio').run(req);

  let result = validationResult(req);

  // verificar si hay errores
  if( !result.isEmpty() ) {
    // errors
    return res.render ( 'auth/signin', {
      page: 'Sign In',
      errors: result.array(),
      csrfToken: req.csrfToken()
    });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });


  // user not found
  if( !user ) {
    return res.render ( 'auth/signin', {
      page: 'Sign In',
      errors: [{msg: 'El usuario no existe'}],
      csrfToken: req.csrfToken()
    });
  }


  // Account unconfirmed
  if(!user.isConfirmed){
    return res.render ( 'auth/signin', {
      page: 'Sign In',
      errors: [{msg: 'Tu cuenta no ha sido confirmada. Revisa tu buzón de correo electrònico'}],
      csrfToken: req.csrfToken()
    });   
  }

   // validate possword
  if( !user.comparePassword( password ) ) {
    return res.render ( 'auth/signin', {
      page: 'Sign In',
      errors: [{msg: 'El usuario o el password no son correctos'}],
      csrfToken: req.csrfToken()
    });
  }

  // authenticate user
  const token = generateJWT( { id: user.id, name: user.name } );

  // store jwt in a cookie
  return res.cookie('_token', token, {
    httpOnly: true,
    //secure: true,
    //sameSite: true
  }).redirect('/properties');
}







const formSignUp = ( req, res ) => {
  res.render ( 'auth/signup', {
    page: 'Sign Up',
    csrfToken: req.csrfToken()
  });
}

const enrol = async ( req, res ) => {

  // validacions

  await check('name').notEmpty().withMessage('El campo nombre es obligatorio').run(req);
  await check('email').isEmail().withMessage('El campo email es obligatorio').run(req);
  await check('password').isLength({ min: 6 }).withMessage('El password ha de tener mínimo 6 caracteres').run(req);
  await check('repeatPassword').equals(req.body.password).withMessage('Los passwords no son iguales').run(req);


  let result = validationResult(req);

  // verificar si hay errores
  if( !result.isEmpty() ) {
    // errors
    return res.render ( 'auth/signup', {
      page: 'Sign Up',
      errors: result.array(),
      user: {
        name: req.body.name,
        email: req.body.email
      },
      csrfToken: req.csrfToken()
    });
  }
  // verificar si el usuario existe

  const { name, email, password } = req.body;
  const existUser = await User.findOne({ where: { email } });

  if( existUser ) {
    return res.render ( 'auth/signup', {
      page: 'Sign Up',
      errors: [{msg: 'El usuario ya está registrado'}],
      user: {
        name: req.body.name,
        email: req.body.email
      },
      csrfToken: req.csrfToken()
    });
  }

  // create user
  const user = await User.create({
    name,
    email,
    password,
    token: generateId()
  });

  // Send email with token to validate account
  emailEnrole({
    name : user.name,
    email : user.email,
    token : user.token
  })

  
  res.render( 'templates/message', {
    page: 'Account created succesfully',
    msg: 'Hemos enviado un Email de Confirmación, presiona en el enlace'
  })
}

// Function to verify account

// next(); // go to the next middleware async ( req, res, next )
const confirmAccount = async ( req, res ) => {
  const { token } = req.params;

  const user = await User.findOne({ where: { token } });

  // find user by token and verify
  // user not found
  if( !user ) {
    return res.render ( 'auth/confirm-account', {
      page: 'Account not found',
      msg: 'El token no es válido. Hubo un error al confirmar tu cuenta',
      error: true
    });
  }
  // confirm account
  // token found

  user.token = null;
  user.isConfirmed = true;
  await user.save();
  res.render ( 'auth/confirm-account', {
    page: 'Account verified!!',
    msg: 'La cuenta se confirmó correctamente'
  });

  
}

const formForgotPassword = ( req, res ) => {
  res.render ( 'auth/forgot-password', {
    page: 'Forgot Password',
    csrfToken: req.csrfToken()
    
  });
}

const resetPassword = async ( req, res ) => {
  // validacion
  await check('email').isEmail().withMessage('El campo email es obligatorio').run(req);


  let result = validationResult(req);

  // verificar si hay errores
  if( !result.isEmpty() ) {
    // errors
    return res.render ( 'auth/forgot-password', {
      page: 'Create a new password',
      csrfToken: req.csrfToken(),
      errors: result.array()
    });                                                                                  
  }

  // find user by email

  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  // user not found
  if( !user ) {
    return res.render ( 'auth/forgot-password', {
      page: 'Create a new password',
      csrfToken: req.csrfToken(),
      errors: [{msg: 'El usuario no existe'}]
    });
  }

  // create a new password with token
  user.token = generateId();
  await user.save();


  // send email with token to reset password
  emailForgotPassword({                                                            
    email: user.email,
    name: user.name,
    token: user.token                                                                                       
  })

  res.render( 'templates/message', {
    page: 'Reboot your password',
    msg: 'Hemos enviado un Email para restablecer tu contraseña'
  })

}

const validateToken = async ( req, res ) => {

  const { token } = req.params;

  const user = await User.findOne({ where: { token } });

  if ( !user ) {
    return res.render ( 'auth/confirm-account', {
      page: 'Reboot Password',
      msg: 'El token no es válido. Hubo un error al confirmar tu cuenta',
      error: true
    });
  }
  
  // shown form to create new password
  res.render( 'auth/reset-password', {
    page: 'Reboot Password',
    csrfToken: req.csrfToken(),

  })
}


const newPassword = async ( req, res ) => {
  // validate password
  await check('password').isLength({ min: 6 }).withMessage('El password ha de tener mínimo 6 caracteres').run(req);

  let result = validationResult(req);

  // verificar si hay errores
  if( !result.isEmpty() ) {
    // errors
    return res.render ( 'auth/reset-password', {
      page: 'Reboot your password',
      csrfToken: req.csrfToken(),
      errors: result.array()
    });                                                                                  
  }

  const { token } = req.params;
  const { password } = req.body;

  // find user by token

  const user = await User.findOne({ where: { token } });

  // hash the password
  const salt = await bcrypt.genSalt(10);
  
  user.password = await bcrypt.hash( password, salt );
  user.token = null;
  
  await user.save();

  res.render ( 'auth/confirm-account', {
    page: 'Password reseted',
    msg: 'La contraseña se ha restablecido correctamente'
  })

}


export {
  formSignIn,
  authenticate,
  formSignUp,
  confirmAccount,
  formForgotPassword,
  resetPassword,
  validateToken,
  newPassword,
  enrol
}

