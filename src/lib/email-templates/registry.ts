import type { ComponentType } from 'react'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
import { template as welcomePostPurchase } from './welcome-post-purchase'
import { template as leadRequestAdmin } from './lead-request-admin'
import { template as leadRequestConfirmation } from './lead-request-confirmation'
import { template as contentPlanAdmin } from './content-plan-admin'
import { template as contentPlanConfirmation } from './content-plan-confirmation'
import { template as folliaPreviewReady } from './follia-preview-ready'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'welcome-post-purchase': welcomePostPurchase,
  'lead-request-admin': leadRequestAdmin,
  'lead-request-confirmation': leadRequestConfirmation,
  'content-plan-admin': contentPlanAdmin,
  'content-plan-confirmation': contentPlanConfirmation,
  'follia-preview-ready': folliaPreviewReady,
}

