import nodemailer from 'nodemailer';

const emailEnrole = async (data) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  const { email, name, token } = data;

  // send email

  await transport.sendMail({
    from: '"Fred Foo 👻"',
    to: email,
    subject: 'Confirm your account on Bienes Raices',
    text: 'Confirm your account on Bienes Raices',
    html: `
      <h1>Welcome to Bienes Raices</h1>
      <p>Hi ${name},</p>
      <p>Please confirm your account by clicking <a href="${process.env.BACKEND_URL}:${process.env.PRORT ?? 3000}/auth/confirm/${token}">here</a></p>
      
      <p>Thanks</p>
      `
  });

}

const emailForgotPassword = async (data) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  const { email, name, token } = data;

  // send email

  await transport.sendMail({
    from: '"Fred Foo 👻"',
    to: email,
    subject: 'Restablece tu password en Bienes Raices',
    text: 'Restablece tu password en Bienes Raices',
    html: `
      <h1>Welcome to Bienes Raices</h1>
      <p>Hi ${name},</p>
      <p>Please confirm your account by clicking <a href="${process.env.BACKEND_URL}:${process.env.PRORT ?? 3000}/auth/forgot-password/${token}">Restart Password</a></p>
      
      <p>Thanks</p>
      `
  });

}

export {
  emailEnrole,
  emailForgotPassword
}