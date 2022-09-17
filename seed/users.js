import bcrypt from 'bcrypt';

const users = [
  {
    name: 'Pepe',
    email: 'pepe@pepe.com',
    isConfirmed: 1,
    password: bcrypt.hashSync('password', 10),
  }
]

export default users;