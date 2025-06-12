import { Router } from 'express';
import { StyleController } from '../controllers/style-controller.js';
import {
  validateRequest,
  createStyleSchema,
  getStyleListSchema,
  getStyleDetailSchema,
  updateStyleSchema,
  deleteStyleSchema
} from '../middlewares/dto-middleware.js';

const router = Router();

router.post('/', validateRequest(createStyleSchema), StyleController.createStyle);                
router.get('/', validateRequest(getStyleListSchema), StyleController.getStyleList);                  
router.get('/:styleId', validateRequest(getStyleDetailSchema), StyleController.getStyleDetail);   
router.put('/:styleId', validateRequest(updateStyleSchema), StyleController.updateStyle);          
router.delete('/:styleId', validateRequest(deleteStyleSchema), StyleController.deleteStyle);       

export default router;

