import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js'
import {
  createSubscription,
  getUserSubscriptions,
  getAllSubscriptions,
  getSubscriptionById,
  deleteSubscription,
} from '../controllers/subscription.controller.js'

const subscriptionRouter = Router();

subscriptionRouter.get('/',authorize,getAllSubscriptions);

subscriptionRouter.get('/:id',authorize, getSubscriptionById);

subscriptionRouter.post('/', authorize, createSubscription);

subscriptionRouter.delete('/:id', authorize, deleteSubscription);

subscriptionRouter.get('/user/:id', authorize, getUserSubscriptions);

subscriptionRouter.get('/upcoming-renewals',authorize, getUpcomingRenewals);

export default subscriptionRouter;