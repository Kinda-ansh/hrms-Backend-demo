const Joi = require("joi");

// Custom validation for word count
const maxWords = (value, helpers) => {
  const wordCount = value.split(/\s+/).length;
  if (wordCount > 3000) {
    return helpers.error("string.maxWords", { max: 3000 });
  }
  return value;
};
const Words = (value, helpers) => {
  const wordCount = value.split(/\s+/).length;
  if (wordCount > 5000) {
    return helpers.error("string.maxWords", { max: 5000 });
  }
  return value;
};

const validateDateFormat = (value, helpers) => {
  const datePattern = /^\d{2}-\d{2}-\d{4}$/;
  if (!datePattern.test(value)) {
    return helpers.message('Date should be in the format DD-MM-YYYY');
  }

  const [day, month, year] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day); // Month is zero-based in JavaScript

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return helpers.message('Date is not a valid date');
  }

  return value; // Return the value as is, keeping it in DD-MM-YYYY format
};



const userValidation = Joi.object({
  fullName: Joi.string()
    .allow("")
    .pattern(/^[A-Za-z\s]*$/)
    .max(25)
    .messages({
      "string.base": "Full Name should be a type of text",
      "string.pattern.base":
        "Full Name should contain only alphabets and spaces",
      "string.max":
        "Full Name should have a maximum length of {#limit} characters",
    }),
  mobileNo: Joi.string()
    .allow("")
    .pattern(/^\d{10}$/)
    .messages({
      "string.base": "Mobile Number should be a type of text",
      "string.pattern.base": "Mobile Number must be exactly 10 digits",
    }),
  dob: Joi.string()
    .allow("")
    .pattern(/^[0-9\/-]*$/)
    .max(20)
    .messages({
      "string.base": "Date of Birth should be a valid date",
      "string.pattern.base": "Date of Birth must follow the allowed format",
      "string.max":
        "Date of Birth should have a maximum length of {#limit} characters",
    }),
  education: Joi.string()
    .allow("")
    .pattern(/^[A-Za-z\s]*$/)
    .max(20)
    .messages({
      "string.base": "Education should be a type of text",
      "string.pattern.base":
        "Education should contain only alphabets and spaces",
      "string.max":
        "Education should have a maximum length of {#limit} characters",
    }),
  occupation: Joi.string()
    .allow("")
    .pattern(/^[A-Za-z\s]*$/)
    .max(20)
    .messages({
      "string.base": "Occupation should be a type of text",
      "string.pattern.base":
        "Occupation should contain only alphabets and spaces",
      "string.max":
        "Occupation should have a maximum length of {#limit} characters",
    }),
  email: Joi.string()
    .allow("")
    .email()
    .pattern(new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"))
    .messages({
      "string.base": "Email should be a type of text",
      "string.email": "Email must be a valid email address",
      "string.pattern.base": "Email must be a valid email address",
    }),
  password: Joi.string()
    .allow("")
    .min(8)
    .max(30)
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,30}$"
      )
    )
    .messages({
      "string.base": "Password should be a type of text",
      "string.min":
        "Password should have a minimum length of {#limit} characters",
      "string.max":
        "Password should have a maximum length of {#limit} characters",
      "string.pattern.base":
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),
});

const newsValidation = Joi.object({
  title: Joi.string().min(20).max(200).messages({
    "string.base": "Title should be a type of text",
    "string.max": "Title should have a maximum length of {#limit} characters",
  }),
  // description: Joi.string().custom(maxWords, "max limit 3000 words").messages({
  //   "string.base": "Description should be a type of text",
  //   "string.maxWords": "Description should have a maximum of {#max} words",
  // }),
  readtime: Joi.string()
    .pattern(/^[A-Za-z0-9\s]*$/)
    .max(15)
    .default("")
    .messages({
      "string.base": "Read Time should be a type of text",
      "string.pattern.base":
        "Read Time should contain only alphabets, numbers, and spaces",
      "string.max":
        "Read Time should have a maximum length of {#limit} characters",
    }),
});

const JobValidation = Joi.object({
  jobtitle: Joi.string().max(200).required().messages({
    "string.base": "Title should be a type of text",
    "string.max": "Title should have a maximum length of {#limit} characters",
    "any.required": "Title is required",
  }),
  jobdescription: Joi.string()
    .custom(maxWords, "max limit 2000 words")
    .required()
    .messages({
      "string.base": "Description should be a type of text",
      "string.maxWords": "Description should have a maximum of {#max} words",
      "any.required": "Description is required",
    }),
});

// const GovUpdateJobValidation = Joi.object({
//   jobtitle: Joi.string().max(200).messages({
//     "string.base": "Title should be a type of text",
//     "string.max": "Title should have a maximum length of {#limit} characters",
//   }),
//   jobdescription: Joi.string()
//     .custom(maxWords, "max limit 2000 words")
//     .messages({
//       "string.base": "Description should be a type of text",
//       "string.maxWords": "Description should have a maximum of {#max} words",
//     }),
//   joburl: Joi.string().max(250).messages({
//     "string.base": "joburl should be a type of text",
//     "string.max": "joburl should have a maximum length of {#limit} characters",
//   }),
//   qualification: Joi.string().max(20).messages({
//     "string.base": "qualification should be a type of text",
//     "string.max":
//       "qualification should have a maximum length of {#limit} characters",
//   }),
//   ageeligibility: Joi.string().max(20).messages({
//     "string.base": "age eligibility should be a type of text",
//     "string.max":
//       "age eligibility should have a maximum length of {#limit} characters",
//   }),

//   goefees: Joi.number().max(10000).messages({
//     "number.base": "General, OBC, EWS Fees   should be a type of number",
//     "number.max": "General, OBC, EWS Fees should not be greater than {#limit}",
//   }),
//   scstphfees: Joi.number().max(10000).messages({
//     "number.base": "SC, ST, PH Fees should be a type of number",
//     "number.max": "SC, ST, PH Fees should not be greater than {#limit}",
//   }),
// });

// const govLatestUpdateValidation = Joi.object({
//   title: Joi.string().min(3).required()
//     .messages({
//       'string.base': 'Title must be a string',
//       'string.empty': 'Title cannot be empty',
//       'string.min': 'Title should have at least 3 characters',
//       'any.required': 'Title is required'
//     }),
  
//   jobId: Joi.string().required()
//     .messages({
//       'string.base': 'Job ID must be a string',
//       'string.empty': 'Job ID cannot be empty',
//       'any.required': 'Job ID is required'
//     }),

//   releaseDate: Joi.date().iso().required()
//     .messages({
//       'date.base': 'Release Date must be a valid date',
//       'date.iso': 'Release Date must follow the ISO format',
//       'any.required': 'Release Date is required'
//     }),

//   category: Joi.string().valid('Government', 'Private', 'Education').required()
//     .messages({
//       'string.base': 'Category must be a string',
//       'any.only': 'Category must be one of Government, Private, or Education',
//       'any.required': 'Category is required'
//     })
// });

const admitCardValidation = Joi.object({
  jobtitle: Joi.string().max(200).messages({
    "string.base": "Title should be a type of text",
    "string.max": "Title should have a maximum length of {#limit} characters",
  }),
  joburl: Joi.string().max(250).messages({
    "string.base": "joburl should be a type of text",
    "string.max": "joburl should have a maximum length of {#limit} characters",
    "any.required": "joburl is required",
  }),
});


const signUpValidation = Joi.object({
  fullName: Joi.string()
    .pattern(/^[A-Za-z\s]*$/)
    .max(25)
    .required()
    .messages({
      "string.base": "Full Name should be a type of text",
      "string.pattern.base":
        "Full Name should contain only alphabets and spaces",
      "string.empty": "Full Name cannot be empty",
      "any.required": "FullName is required",
      "string.max":
        "Full Name should have a maximum length of {#limit} characters",
    }),
  mobileNo: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.base": "Mobile Number should be a type of text",
      "string.empty": "Mobile Number cannot be empty",
      "string.pattern.base": "Mobile Number must be exactly 10 digits",
      "any.required": "Mobile Number is required",
    }),
  email: Joi.string()
    .regex(/^.{3,}@gmail\.com$/)
    .required()
    .messages({
      "string.base": "Email should be a type of text",
      "string.empty": "Email cannot be empty",
      "string.pattern.base": 'Email must be in the format "xyz@gmail.com"',
      "any.required": "Email is required",
    }),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,30}$"
      )
    )
    .required()
    .messages({
      "string.base": "Password should be a type of text",
      "string.empty": "Password cannot be empty",
      "string.min":
        "Password should have a minimum length of {#limit} characters",
      "string.max":
        "Password should have a maximum length of {#limit} characters",
      "string.pattern.base":
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),
});

const loginValidation = Joi.object({
  mobileNo: Joi.string()
    .pattern(/^\d{10}$/)
    .messages({
      "string.base": "Mobile Number should be a type of text",
      "string.empty": "Mobile Number cannot be empty",
      "string.pattern.base": "Mobile Number must be exactly 10 digits",
    }),
  email: Joi.string()
    .regex(/^.{3,}@gmail\.com$/)
    .messages({
      "string.base": "Email should be a type of text",
      "string.empty": "Email cannot be empty",
      "string.pattern.base": 'Email must be in the format "xyz@gmail.com"',
    }),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,30}$"
      )
    )
    .required()
    .messages({
      "string.base": "Password should be a type of text",
      "string.empty": "Password cannot be empty",
      "string.min":
        "Password should have a minimum length of {#limit} characters",
      "string.max":
        "Password should have a maximum length of {#limit} characters",
      "string.pattern.base":
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
      "any.required": "Email is required",
    }),
});

const ContactValidation = Joi.object({
  fullName: Joi.string()
    .pattern(/^[A-Za-z\s]*$/)
    .max(25)
    .messages({
      "string.base": "Full Name should be a type of text",
      "string.pattern.base":
        "Full Name should contain only alphabets and spaces",
      "string.empty": "Full Name cannot be empty",
      "string.max":
        "Full Name should have a maximum length of {#limit} characters",
    }),
  subject: Joi.string().max(100).messages({
    "string.base": "Subject should be a type of text",
    "string.pattern.base": "Subject should contain only alphabets and spaces",
    "string.empty": "Subject cannot be empty",
    "string.max": "Subject should have a maximum length of {#limit} characters",
  }),
  message: Joi.string().max(600).messages({
    "string.base": "Description should be a type of text",
    "string.maxWords": "Description should have a maximum of {#max} words",
    "any.required": "Description is required",
  }),
  email: Joi.string()
    .email()
    .pattern(new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"))
    .messages({
      "string.base": "Email should be a type of text",
      "string.empty": "Email cannot be empty",
      "string.email": "Email must be a valid email address",
      "string.pattern.base": "Email must be a valid email address",
    }),
});

const FaqValidation = Joi.object({
  title: Joi.string().max(200).messages({
    "string.base": "Title should be a type of text",
    "string.pattern.base": "Title should contain only alphabets and spaces",
    "string.empty": "Title cannot be empty",
    "string.max": "Title should have a maximum length of {#limit} characters",
  }),
  description: Joi.string().max(500).messages({
    "string.base": "Description should be a type of text",
    "string.maxWords": "Description should have a maximum of {#max} words",
    "any.required": "Description is required",
  }),
});

const highlightsValidation = Joi.object({
  title: Joi.string().trim().max(255).messages({
    "string.base": "Title should be a type of text",
    "string.empty": "Title cannot be empty",
    "string.max": "Title should not exceed {#limit} characters",
  }),
  description: Joi.string().trim().max(500).default("").messages({
    "string.base": "Description should be a type of text",
    "string.max": "Description should not exceed {#limit} characters",
  }),
  url: Joi.string().trim().max(200).messages({
    "string.base": "URL should be a type of text",
    "string.max": "URL should not exceed {#limit} characters",
  }),
  priority: Joi.number().integer().less(9).messages({
    "number.base": "Priority should be a number",
    "number.integer": "Priority should be an integer",
    "number.less": "Priority should be less than {#limit}",
    "any.required": "Priority is required",
  }),
  postdate: Joi.string()
    .trim()
    .pattern(/^\d{2}\/\d{2}\/\d{4}$/)
    .messages({
      "string.base": "Post Date should be a type of text",
      "string.pattern.base": "Post Date must be in the format dd/mm/yyyy",
    }),
  lastdate: Joi.string()
    .trim()
    .pattern(/^\d{2}\/\d{2}\/\d{4}$/)
    .messages({
      "string.base": "Last Date should be a type of text",
      "string.pattern.base": "Last Date must be in the format dd/mm/yyyy",
    }),
  examdate: Joi.string()
    .trim()
    .max(20)
    .messages({
      "string.base": "Exam Date should be a type of text",
    }),
  qualification: Joi.string().trim().max(50).messages({
    "string.base": "Qualification should be a type of text",
    "string.max": "Qualification should not exceed {#limit} characters",
  }),
  ageeligibility: Joi.string().max(20).messages({
    "string.base": "age eligibility should be a type of text",
    "string.max":
      "age eligibility should have a maximum length of {#limit} characters",
    "any.required": "age eligibility is required",
  })
});

const bannerValidation = Joi.object({
  title: Joi.string().trim().max(255).messages({
    "string.base": "Title should be a type of text",
    "string.empty": "Title cannot be empty",
    "string.max": "Title should not exceed {#limit} characters",
  }),
  redirectLink: Joi.string().trim().max(300).messages({
    "string.base": "URL should be a type of text",
    "string.max": "URL should not exceed {#limit} characters",
  }),
  priority: Joi.number().integer().less(10).greater(0).messages({
    "number.base": "Priority should be a number",
    "number.integer": "Priority should be an integer",
    "number.less": "Priority should be less than {#limit}",
    "any.required": "Priority is required",
  }),
});

const FreelanceValidation = Joi.object({
  title: Joi.string().max(300).messages({
    "string.base": "Title should be a type of text",
    "string.max": "Title should have a maximum length of {#limit} characters",
  }),
  description: Joi.string().custom(maxWords, "max limit 200 words").messages({
    "string.base": "Description should be a type of text",
    "string.maxWords": "Description should have a maximum of {#max} words",
  }),
  url: Joi.string().max(300).messages({
    "string.max": "URL should have a maximum length of {#limit} characters",
  }),
  source: Joi.string().messages({
    "string.base": "Source should be a type of text",
    "string.max": "Source should have a maximum length of {#limit} characters",
  }),
  budget: Joi.string().max(30).messages({
    "string.base": "budget should be a type of text",
    "string.max": "budget should have a maximum length of {#limit} characters",
  }),
  skills: Joi.array().items(Joi.string().max(100)).max(10).messages({
    "array.base": "Skills should be an array of strings",
    "array.items": "Each skill should be a string with a maximum length of {#limit} characters",
    "array.max": "Skills should contain at most {#limit} items",
  }),
});
const BlogValidation = Joi.object({
  title: Joi.string().max(300).messages({
    "string.base": "Title should be a type of text",
    "string.max": "Title should have a maximum length of {#limit} characters",
  }),
  description: Joi.string().custom(Words, "max limit 5000 words").messages({
    "string.base": "Description should be a type of text",
    "string.maxWords": "Description should have a maximum of {#max} words",
  }),
  // keywords: Joi.array().items(Joi.string().max(100)).max(10).messages({
  //   "array.base": "keywords should be an array of strings",
  //   "array.items": "Each keyword should be a string with a maximum length of {#limit} characters",
  //   "array.max": "keywords should contain at most {#limit} items",
  // }),
});

// const privateJobSchemaValidation = Joi.object({
//   title: Joi.string()
//     .max(200)
//     .required()
//     .messages({
//       'string.base': 'Job title must be a string',
//       'string.empty': 'Job title is required',
//       'string.max': 'Job title should not exceed 200 characters',
//       'any.required': 'Job title is required',
//     }),
//   description: Joi.string()
//     .required()
//     .messages({
//       'string.base': 'Description must be a string',
//       'string.empty': 'Description is required',
//       'any.required': 'Description is required',
//     }),
//   skillsRequired: Joi.array()
//     .items(Joi.string())
//     .optional()
//     .messages({
//       'array.base': 'Skills should be an array of strings',
//     }),
//   location: Joi.string()
//     .required()
//     .messages({
//       'string.base': 'Location must be a string',
//       'string.empty': 'Location is required',
//       'any.required': 'Location is required',
//     }),
//   salaryRange: Joi.object({
//     min: Joi.number().optional(),
//     max: Joi.number().optional(),
//   }).optional().messages({
//     'object.base': 'Salary range must be an object',
//     'number.base': 'Salary values must be numbers',
//   }),
//   salaryCurrType: Joi.string()
//     .valid('INR', 'USD')
//     .messages({
//       'any.only': 'Salary currency type must be either INR or USD',
//       'string.empty': 'Salary currency type is required',
//       'any.required': 'Salary currency type is required',
//     }),
//   type: Joi.string()
//     .valid('remote', 'part-time', 'full-time')
//     .required()
//     .messages({
//       'any.only': 'Job type must be either remote, part-time, or full-time',
//       'string.empty': 'Job type is required',
//       'any.required': 'Job type is required',
//     }),
//   experienceYears: Joi.number()
//     .optional()
//     .messages({
//       'number.base': 'Experience years must be a number',
//     }),
//   educationRequired: Joi.string()
//     .optional()
//     .messages({
//       'string.base': 'Education field must be a string',
//     }),
//   industry: Joi.string()
//     .optional()
//     .messages({
//       'string.base': 'Industry must be a string',
//     }),
//   postdate: Joi.date()
//     .optional()
//     .messages({
//       'date.base': 'Postdate must be a valid date',
//     }),
//   contactEmail: Joi.string()
//     .email()
//     .optional()
//     .messages({
//       'string.email': 'Contact email must be a valid email',
//     }),
//   contactPhone: Joi.string()
//     .optional()
//     .messages({
//       'string.base': 'Contact phone must be a string',
//     }),
//   jobURL: Joi.string()
//     .uri()
//     .optional()
//     .messages({
//       'string.uri': 'Job URL must be a valid URL',
//     }),
//   companyName: Joi.string()
//     .required()
//     .messages({
//       'string.base': 'Company name must be a string',
//       'string.empty': 'Company name is required',
//       'any.required': 'Company name is required',
//     }),
//   source: Joi.string()
//     .optional()
//     .messages({
//       'string.base': 'Source must be a string',
//     }),
// });



const privateJobSchemaValidation = Joi.object({
  title: Joi.string()
    .max(200)
    .required()
    .messages({
      'string.base': 'Job title must be a string',
      'string.empty': 'Job title is required',
      'string.max': 'Job title should not exceed 200 characters',
      'any.required': 'Job title is required',
    }),
  description: Joi.string()
    .required()
    .messages({
      'string.base': 'Description must be a string',
      'string.empty': 'Description is required',
      'any.required': 'Description is required',
    }),
  skillsRequired: Joi.array()
    .items(Joi.string())
    .optional()
    .messages({
      'array.base': 'Skills should be an array of strings',
    }),
  salaryCurrType: Joi.string()
    .valid('INR', 'USD')
    .allow(null)  // Allow null values for salary currency type
    .messages({
      'any.only': 'Salary currency type must be either INR or USD',
    }),
  type: Joi.string()
    .valid('remote', 'part-time', 'full-time')
    .required()
    .messages({
      'any.only': 'Job type must be either remote, part-time, or full-time',
      'string.empty': 'Job type is required',
      'any.required': 'Job type is required',
    }),
  postdate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Postdate must be a valid date',
    }),

  jobURL: Joi.string()
    .uri()
    .required()  // jobURL is now required
    .messages({
      'string.uri': 'Job URL must be a valid URL',
      'any.required': 'Job URL is required',
    }),
});




const GovJobValidation = Joi.object({
  jobtitle: Joi.string().max(200).required().messages({
    "string.base": "Title should be a type of text",
    "string.max": "Title should have a maximum length of {#limit} characters",
    "any.required": "Title is required",
  }),
  jobdescription: Joi.string()
    .custom(maxWords, "max limit 2000 words")
    .required()
    .messages({
      "string.base": "Description should be a type of text",
      "string.maxWords": "Description should have a maximum of {#max} words",
      "any.required": "Description is required",
    }),

});


module.exports = {
  userValidation,
  GovJobValidation,
  // GovUpdateJobValidation,
  newsValidation,
  signUpValidation,
  loginValidation,
  admitCardValidation,
  JobValidation,
  FaqValidation,
  ContactValidation,
  highlightsValidation,
  bannerValidation,
  FreelanceValidation,
  BlogValidation,
  privateJobSchemaValidation
};
