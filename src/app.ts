require('dotenv').config();
import { Application, json, urlencoded } from 'express';
import { RegisterRoutes } from './build/routes';

export class App {
  app: Application;
  PORT: string;
  constructor() {
    this.app = require('express')();
    this.PORT = process.env.PORT;
    this.initiateMiddlewares();
    this.initiateRoutes();
  }

  initiateMiddlewares() {
    this.app.use(urlencoded({ extended: true }));
    this.app.use(json());
  }

  initiateRoutes() {
    RegisterRoutes(this.app);
  }

  listen() {
    this.app.listen(this.PORT, () => {
      console.log(`Server running on ${this.PORT}`);
    });
  }
}
