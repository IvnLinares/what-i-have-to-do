const { z } = require('zod');

const taskSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  completed: z.boolean().optional(),
  category_id: z.number().optional().nullable(),
  tags: z.array(z.number()).optional()
});

const updateTaskSchema = taskSchema.partial();

module.exports = {
  taskSchema,
  updateTaskSchema,
};
