import { Router } from 'express';
import profileRoute from './profile';

const v1Router = Router();

v1Router.use('/profile', profileRoute);

v1Router.get('/', (req, res) => {
  res.send('Hello, World!');
});

export default v1Router;
