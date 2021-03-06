import express from 'express';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import passport from 'passport';
import logger from './services/logger';
import mongoose from './services/mongoose';
import api from './api';
import config from './config';

const app = express();
const port = process.env.PORT || 3000;
const rootApi = '/api/v1';
const ROOT_FOLDER = '/home/app/{{cookiecutter.project_slug}}/src';
// Security
app.use(helmet());

// compression
app.use(compression());

// logs http request
app.use(morgan('dev', { stream: logger.stream }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// passport
app.use(passport.initialize());

// database
mongoose.connect(
  config.mongodb.url,
  { useNewUrlParser: true, useCreateIndex: true }
);

app.use(express.static(path.join(ROOT_FOLDER, 'client/build')));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) =>
  res.json({ message: 'Welcome to Meal Planner API!' })
);

app.use(rootApi, api);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('/admin', (req, res) => {
  res.sendFile(path.join(ROOT_FOLDER, 'client/build/index.html'));
});

app.use(function(req, res, next) {
  res.status(404).send('Page not found!');
});

app.use(function(err, req, res, next) {
  logger.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => logger.info(`Example app listening on port ${port}!`));

logger.info('Hello world');
logger.warn('Warning message');
logger.debug('Debugging info');
