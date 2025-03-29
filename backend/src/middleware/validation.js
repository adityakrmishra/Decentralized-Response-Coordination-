import Joi from 'joi';
import createError from 'http-errors';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      allowUnknown: false
    });

    if (error) {
      const errors = error.details.map(err => ({
        field: err.path.join('.'),
        message: err.message.replace(/['"]+/g, '')
      }));

      return next(createError.BadRequest({
        type: 'ValidationError',
        errors
      }));
    }

    req[source] = value;
    next();
  };
};

// Schemas
export const schemas = {
  userRegistration: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
      .required(),
    name: Joi.string().min(2).required(),
    role: Joi.string().valid('user', 'responder', 'admin').default('user'),
    walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required()
  }),

  disasterReport: Joi.object({
    type: Joi.string().valid('earthquake', 'flood', 'fire', 'medical').required(),
    severity: Joi.number().min(1).max(5).required(),
    location: Joi.object({
      coordinates: Joi.array().items(Joi.number()).length(2).required(),
      radius: Joi.number().min(100).required()
    }).required(),
    description: Joi.string().max(500).required()
  }),

  resourceAllocation: Joi.object({
    disasterId: Joi.string().hex().length(24).required(),
    resourceType: Joi.string().valid('medical', 'food', 'shelter', 'equipment').required(),
    quantity: Joi.number().min(1).required(),
    priority: Joi.string().valid('low', 'medium', 'high').required()
  }),

  droneMission: Joi.object({
    coordinates: Joi.array().items(
      Joi.array().items(Joi.number()).length(3) // [lat, lon, alt]
    ).min(1).required(),
    payload: Joi.object({
      type: Joi.string().required(),
      weight: Joi.number().max(5).required() // kg
    }).required(),
    emergencyProtocol: Joi.string().valid('rtl', 'hover', 'land').default('rtl')
  }),

  pagination: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    sort: Joi.string().pattern(/^[a-zA-Z]+:(asc|desc)$/),
    filter: Joi.object()
  })
};

export const validateCoordinates = (value, helpers) => {
  const [lat, lon] = value;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return helpers.error('any.invalid');
  }
  return value;
};

export const blockchainAddress = (value, helpers) => {
  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};
