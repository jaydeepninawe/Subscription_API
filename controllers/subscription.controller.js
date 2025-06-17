import Subscription from '../models/subscription.model.js';
import { workflowClient } from '../config/upstash.js';
import { SERVER_URL } from '../config/env.js';


export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        'content-type': 'application/json',
      },
      retries: 0,
    });

    res.status(201).json({ success: true, data: { subscription, workflowRunId } });
  } catch (e) {
    next(e);
  }
};

// Get subscriptions of a specific user
export const getUserSubscriptions = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      const error = new Error('You are not the owner of this account');
      error.status = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
};


export const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find().populate('user', 'name email');

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (e) {
    next(e);
  }
};

// Get subscription details by ID
export const getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id).populate('user', 'name email');

    if (!subscription) {
      const error = new Error('Subscription not found');
      error.status = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (e) {
    next(e);
  }
};


export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error('Subscription not found');
      error.status = 404;
      throw error;
    }

    // Check if the requester is the owner
    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error('You are not authorized to delete this subscription');
      error.status = 403;
      throw error;
    }

    await subscription.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Subscription deleted successfully',
    });
  } catch (e) {
    next(e);
  }
};


export const getUpcomingRenewals = async (req, res, next) => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7); // Next 7 days

    const upcoming = await Subscription.find({
      user: req.user._id,
      renewalDate: { $gte: today, $lte: nextWeek },
      status: 'active',
    }).sort({ renewalDate: 1 });

    res.status(200).json({
      success: true,
      count: upcoming.length,
      data: upcoming,
    });
  } catch (e) {
    next(e);
  }
};

