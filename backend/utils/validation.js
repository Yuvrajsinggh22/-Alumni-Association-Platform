const Joi = require('joi');

// Alumni registration validation
const alumniRegistrationSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(/^[+]?[1-9][\d]{0,15}$/).optional(),
  graduationYear: Joi.number().integer().min(1950).max(new Date().getFullYear()).required(),
  degree: Joi.string().required(),
  currentPosition: Joi.string().optional().allow(''),
  currentCompany: Joi.string().optional().allow(''),
  location: Joi.string().optional().allow(''),
  bio: Joi.string().max(500).optional().allow(''),
  skills: Joi.array().items(Joi.string()).optional(),
  interests: Joi.array().items(Joi.string()).optional(),
  linkedinUrl: Joi.string().uri().optional().allow(''),
  githubUrl: Joi.string().uri().optional().allow(''),
  twitterUrl: Joi.string().uri().optional().allow(''),
  website: Joi.string().uri().optional().allow('')
});

// Alumni profile update validation
const alumniUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^[+]?[1-9][\d]{0,15}$/).optional(),
  currentJob: Joi.string().optional().allow(''),
  currentCompany: Joi.string().optional().allow(''),
  location: Joi.string().optional().allow(''),
  bio: Joi.string().max(500).optional().allow(''),
  skills: Joi.array().items(Joi.string()).optional(),
  interests: Joi.array().items(Joi.string()).optional(),
  linkedinUrl: Joi.string().uri().optional().allow(''),
  githubUrl: Joi.string().uri().optional().allow(''),
  websiteUrl: Joi.string().uri().optional().allow(''),
  isPublic: Joi.boolean().optional()
});

// Login validation
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Job posting validation
const jobSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(50).required(),
  company: Joi.string().required(),
  location: Joi.string().required(),
  jobType: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE').required(),
  experienceLevel: Joi.string().valid('ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'EXECUTIVE').required(),
  skills: Joi.array().items(Joi.string()).min(1).required(),
  salary: Joi.string().optional().allow(''),
  applicationUrl: Joi.string().uri().optional().allow('')
});

// Event creation validation
const eventSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(20).required(),
  location: Joi.string().required(),
  eventDate: Joi.date().greater('now').required(),
  endDate: Joi.date().greater(Joi.ref('eventDate')).optional(),
  ticketPrice: Joi.number().min(0).optional(),
  maxAttendees: Joi.number().integer().min(1).optional()
});

// Donation validation
const donationSchema = Joi.object({
  amount: Joi.number().positive().min(1).required(),
  currency: Joi.string().length(3).uppercase().default('USD'),
  purpose: Joi.string().max(200).optional().allow(''),
  paymentMethod: Joi.string().valid('STRIPE', 'RAZORPAY', 'PAYPAL', 'BANK_TRANSFER').required()
});

// Feedback validation
const feedbackSchema = Joi.object({
  category: Joi.string().valid('GENERAL', 'TECHNICAL', 'FEATURE_REQUEST', 'BUG_REPORT', 'COMPLAINT').required(),
  subject: Joi.string().min(5).max(200).required(),
  message: Joi.string().min(10).required(),
  rating: Joi.number().integer().min(1).max(5).optional()
});

// Success story validation
const successStorySchema = Joi.object({
  title: Joi.string().min(10).max(200).required(),
  content: Joi.string().min(100).required(),
  proofLink: Joi.string().uri().optional().allow('')
});

// Message validation
const messageSchema = Joi.object({
  receiverId: Joi.string().required(),
  content: Joi.string().min(1).max(1000).required()
});

// Admin creation validation
const adminSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).max(100).required(),
  role: Joi.string().valid('SUPER_ADMIN', 'ADMIN', 'MODERATOR').default('MODERATOR')
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    
    req.validatedData = value;
    next();
  };
};

module.exports = {
  validate,
  schemas: {
    alumniRegistration: alumniRegistrationSchema,
    alumniUpdate: alumniUpdateSchema,
    login: loginSchema,
    job: jobSchema,
    event: eventSchema,
    donation: donationSchema,
    feedback: feedbackSchema,
    successStory: successStorySchema,
    message: messageSchema,
    admin: adminSchema
  }
};
