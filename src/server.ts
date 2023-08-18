import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

import {
  users,
  posts,
  search,
  followers,
  shopping,
  upload,
  conversation,
  message,
} from './routes';
import { notFoundError, serverError } from './controllers/errorHandling';

const app = express();
const PORT = Number(process.env.PORT);
const BASE_API_PATH = process.env.BASE_API_PATH;
const MAX_REQUEST_SIZE = process.env.MAX_REQUEST_SIZE;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.json({ limit: `${MAX_REQUEST_SIZE}mb` }));
app.use(
  express.urlencoded({
    extended: true,
    limit: `${MAX_REQUEST_SIZE}mb`,
  })
);

app.use('/uploads', express.static('uploads'));

app.use(`${BASE_API_PATH}/users`, users);
app.use(`${BASE_API_PATH}/posts`, posts);
app.use(`${BASE_API_PATH}/search`, search);
app.use(`${BASE_API_PATH}/follow`, followers);
app.use(`${BASE_API_PATH}/shop`, shopping);
app.use(`${BASE_API_PATH}/file`, upload);
app.use(`${BASE_API_PATH}/conversation`, conversation);
app.use(`${BASE_API_PATH}/message`, message);

// Error Handling
app.use(notFoundError);
app.use(serverError);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
