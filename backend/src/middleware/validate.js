const { ZodError } = require('zod');

/**
 * Generic Zod validation middleware factory.
 * Validates req.body (and optionally req.params / req.query) against a Zod schema.
 *
 * @param {Object} schemas - { body?: ZodSchema, params?: ZodSchema, query?: ZodSchema }
 * @returns {Function} Express middleware
 *
 * Usage:
 *   validate({ body: registerSchema })
 *   validate({ body: updateSchema, params: z.object({ id: z.string() }) })
 */
const validate = (schemas) => {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod v4 uses `issues`, v3 used `errors` — handle both
        const issues = error.issues || error.errors || [];
        const formattedErrors = issues.map((err) => ({
          field: (err.path || []).join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed.',
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };
};

module.exports = { validate };
