import { Router } from 'express';
import { listProducts, getProduct } from '../controllers/products.js';
export const productRouter = Router();
productRouter.get('/', listProducts);
productRouter.get('/:id', getProduct);
