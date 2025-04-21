import Joi from "joi";

export const ALLOWED_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "zoho.com",
  "proton.me",
  "yandex.ru",
];

export const userSchema = Joi.object({
  name: Joi.string()
    .required()
    .trim()
    .regex(/^[a-zA-Z\s'-]+$/) // Allow letters, spaces, hyphens, and apostrophes
    .messages({
      "string.empty": "Name is required and cannot be empty",
      "string.pattern.base":
        "Name cannot contain special characters. Only letters, spaces, hyphens, and apostrophes are allowed.",
    }),

  email: Joi.string()
    .required()
    .trim()
    .email({ tlds: { allow: false } })
    .custom((value, helpers) => {
      const domain = value.split("@")[1];
      if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
        return helpers.error("any.invalid");
      }
      return value;
    }) 
    .messages({
      "string.empty": "Email is required and cannot be empty",
      "string.email":
        "Invalid email format or domain. Please use a valid email address.",
      "any.invalid":
        "Email domain is not allowed. Please use an accepted domain. like gmail",
    }), // Validate email format

  password: Joi.string()
    .required()
    .trim()
    .min(8) // Minimum password length
    .messages({
      "string.empty": "Password is required and cannot be empty",
      "string.min": "Password must be at least 8 characters long",
    }),
});
