import { z } from 'zod'

// Base validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format')

export const slugSchema = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(100, 'Slug must be less than 100 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')

export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .optional()

// Organization schemas
export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(255, 'Organization name must be less than 255 characters'),
  slug: slugSchema
})

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(255, 'Organization name must be less than 255 characters')
    .optional(),
  slug: slugSchema.optional()
})

// User schemas
export const createUserSchema = z.object({
  id: uuidSchema,
  email: z.string().email('Invalid email format'),
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name must be less than 255 characters')
    .optional(),
  avatar_url: urlSchema
})

export const updateUserSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name must be less than 255 characters')
    .optional(),
  avatar_url: urlSchema
})

// Brand schemas
export const createBrandSchema = z.object({
  organization_id: uuidSchema,
  name: z
    .string()
    .min(2, 'Brand name must be at least 2 characters')
    .max(255, 'Brand name must be less than 255 characters'),
  domain: z
    .string()
    .max(255, 'Domain must be less than 255 characters')
    .regex(
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,
      'Invalid domain format'
    )
    .optional(),
  logo_url: urlSchema,
  is_competitor: z.boolean().optional().default(false)
})

export const updateBrandSchema = z.object({
  name: z
    .string()
    .min(2, 'Brand name must be at least 2 characters')
    .max(255, 'Brand name must be less than 255 characters')
    .optional(),
  domain: z
    .string()
    .max(255, 'Domain must be less than 255 characters')
    .regex(
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,
      'Invalid domain format'
    )
    .optional(),
  logo_url: urlSchema,
  is_competitor: z.boolean().optional()
})

// Topic schemas
export const createTopicSchema = z.object({
  organization_id: uuidSchema,
  name: z
    .string()
    .min(2, 'Topic name must be at least 2 characters')
    .max(255, 'Topic name must be less than 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
})

export const updateTopicSchema = z.object({
  name: z
    .string()
    .min(2, 'Topic name must be at least 2 characters')
    .max(255, 'Topic name must be less than 255 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
})

// Prompt schemas
export const createPromptSchema = z.object({
  organization_id: uuidSchema,
  text: z
    .string()
    .min(10, 'Prompt text must be at least 10 characters')
    .max(5000, 'Prompt text must be less than 5000 characters'),
  language: z
    .string()
    .length(2, 'Language must be a 2-character code')
    .regex(/^[a-z]{2}$/, 'Language must be lowercase')
    .optional()
    .default('en'),
  region: z
    .string()
    .length(2, 'Region must be a 2-character code')
    .regex(/^[a-z]{2}$/, 'Region must be lowercase')
    .optional()
    .default('us'),
  tags: z
    .array(z.string().min(1, 'Tag cannot be empty').max(50, 'Tag must be less than 50 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
  is_active: z.boolean().optional().default(true)
})

export const updatePromptSchema = z.object({
  text: z
    .string()
    .min(10, 'Prompt text must be at least 10 characters')
    .max(5000, 'Prompt text must be less than 5000 characters')
    .optional(),
  language: z
    .string()
    .length(2, 'Language must be a 2-character code')
    .regex(/^[a-z]{2}$/, 'Language must be lowercase')
    .optional(),
  region: z
    .string()
    .length(2, 'Region must be a 2-character code')
    .regex(/^[a-z]{2}$/, 'Region must be lowercase')
    .optional(),
  tags: z
    .array(z.string().min(1, 'Tag cannot be empty').max(50, 'Tag must be less than 50 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  is_active: z.boolean().optional()
})

// Prompt with topics schema
export const createPromptWithTopicsSchema = z.object({
  prompt: createPromptSchema,
  topic_ids: z
    .array(uuidSchema)
    .min(1, 'At least one topic must be selected')
    .max(5, 'Maximum 5 topics allowed')
    .optional()
})

export const updatePromptWithTopicsSchema = z.object({
  prompt: updatePromptSchema,
  topic_ids: z
    .array(uuidSchema)
    .max(5, 'Maximum 5 topics allowed')
    .optional()
})

// Filter schemas
export const brandFiltersSchema = z.object({
  organization_id: uuidSchema.optional(),
  is_competitor: z.boolean().optional(),
  search: z.string().max(255, 'Search term must be less than 255 characters').optional()
})

export const topicFiltersSchema = z.object({
  organization_id: uuidSchema.optional(),
  search: z.string().max(255, 'Search term must be less than 255 characters').optional()
})

export const promptFiltersSchema = z.object({
  organization_id: uuidSchema.optional(),
  topic_id: uuidSchema.optional(),
  is_active: z.boolean().optional(),
  language: z.string().length(2).regex(/^[a-z]{2}$/).optional(),
  region: z.string().length(2).regex(/^[a-z]{2}$/).optional(),
  search: z.string().max(255, 'Search term must be less than 255 characters').optional()
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').optional().default(1),
  per_page: z.number().int().min(1, 'Per page must be at least 1').max(100, 'Per page cannot exceed 100').optional().default(10),
  sort_by: z.string().max(50, 'Sort field must be less than 50 characters').optional().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc')
})

// Common validation functions
export const validateUUID = (value: string): boolean => {
  return uuidSchema.safeParse(value).success
}

export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success
}

export const validateSlug = (slug: string): boolean => {
  return slugSchema.safeParse(slug).success
}

export const validateURL = (url: string): boolean => {
  return z.string().url().safeParse(url).success
}

// Type inference from schemas
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateBrandInput = z.infer<typeof createBrandSchema>
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>
export type CreateTopicInput = z.infer<typeof createTopicSchema>
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>
export type CreatePromptInput = z.infer<typeof createPromptSchema>
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>
export type BrandFilters = z.infer<typeof brandFiltersSchema>
export type TopicFilters = z.infer<typeof topicFiltersSchema>
export type PromptFilters = z.infer<typeof promptFiltersSchema>
export type PaginationParams = z.infer<typeof paginationSchema>