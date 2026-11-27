export type Role = 'SUPERADMIN' | 'ADMIN' | 'MANAGER'
export type Gender = 'MALE' | 'FEMALE'
export type MediaType = 'CATALOG' | 'NEWS' | 'REVIEW' | 'GALLERY'
export type SiteSectionKey = MediaType | 'COACHES'
export type LeadStatus =
  | 'NEW'
  | 'IN_PROGRESS'
  | 'PROCESSED'
  | 'TRIAL'
  | 'ENROLLED'
  | 'LOST'
  | 'DONE'

export type LeadActivityType =
  | 'STATUS'
  | 'ASSIGNEE'
  | 'NOTE'
  | 'CALL'
  | 'CALLBACK'
  | 'SYSTEM'

export type CallResult = 'answered' | 'no_answer' | 'busy' | 'callback'
export type LeadCallbackFilter = 'today' | 'overdue' | 'upcoming'

export interface LeadAssignee {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  role: Role
}

export interface LeadActivityUser {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
}

export interface LeadActivity {
  id: string
  leadId: string
  userId?: string | null
  user?: LeadActivityUser | null
  type: LeadActivityType
  body?: string | null
  meta?: Record<string, unknown> | null
  createdAt: string
}

export interface RelatedLead {
  id: string
  name: string
  status: LeadStatus
  source?: string | null
  createdAt: string
  assignee?: LeadAssignee | null
}

export interface User {
  id: string
  email: string
  role: Role
  firstName?: string | null
  lastName?: string | null
  gender?: Gender | null
  birthDate?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  user: User
}

export interface MediaItem {
  id: string
  type: MediaType
  title: string
  imageUrl: string
  imageUrls?: string[]
  body?: string | null
  topic?: string | null
  category?: string | null
  sku?: string | null
  quantity?: number | null
  slug?: string | null
  description?: string | null
  price?: number | null
  discount?: number | null
  salePrice?: number | null
  sortOrder: number
  published: boolean
  publishAt?: string | null
  unpublishAt?: string | null
  createdAt: string
  updatedAt: string
}

export type MediaSortField =
  | 'title'
  | 'category'
  | 'topic'
  | 'price'
  | 'salePrice'
  | 'published'
  | 'createdAt'
  | 'sortOrder'

export interface MediaPageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  sort?: MediaSortField
  order?: 'asc' | 'desc'
}

export interface MediaPage {
  items: MediaItem[]
  meta: MediaPageMeta
}

export type UserSortField = 'email' | 'role' | 'createdAt'

export interface UsersMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  sort: UserSortField
  order: 'asc' | 'desc'
}

export interface UsersPage {
  items: User[]
  meta: UsersMeta
}

export interface AuditLog {
  id: string
  actorId?: string | null
  actorEmail?: string | null
  action: string
  entity?: string | null
  entityId?: string | null
  summary: string
  meta?: Record<string, unknown> | null
  ip?: string | null
  createdAt: string
}

export interface AuditPage {
  items: AuditLog[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    sort?: string
    order?: 'asc' | 'desc'
  }
}

export interface Coach {
  id: string
  name: string
  role: string
  experience: string
  bio: string
  specialties: string[]
  imageUrl?: string | null
  imageAlt?: string | null
  sortOrder: number
  published: boolean
  createdAt: string
  updatedAt: string
}

export type CoachSortField = 'name' | 'role' | 'published' | 'createdAt' | 'sortOrder'

export interface CoachesPage {
  items: Coach[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    sort?: CoachSortField
    order?: 'asc' | 'desc'
  }
}

export type TaxonomyKind = 'NEWS_TOPIC' | 'CATALOG_CATEGORY' | 'COACH_SPECIALTY'

export interface TaxonomyItem {
  id: string
  kind: TaxonomyKind
  name: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface SectionStatus {
  key: SiteSectionKey
  enabled: boolean
  itemCount: number
  canEnable: boolean
  visible: boolean
}

export type SiteFeatureKey = 'CART' | 'FAVORITES' | 'SECTION_EDGES'

export interface FeatureStatus {
  key: SiteFeatureKey
  label: string
  description: string
  enabled: boolean
}

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeStatus {
  mode: ThemeMode
}

export interface ContactsStatus {
  phone: string
  phoneHours: string
  phoneHoursFrom?: string
  phoneHoursTo?: string
  email: string
  socials: {
    vk: string
    telegram: string
    youtube: string
  }
}

export type HomeBlockKey =
  | 'hero'
  | 'stats'
  | 'programs'
  | 'painPoints'
  | 'audience'
  | 'childBenefits'
  | 'steps'
  | 'progression'
  | 'trainingQuality'
  | 'conditions'
  | 'ecosystem'
  | 'advantages'
  | 'video'
  | 'locations'
  | 'gallery'
  | 'catalog'
  | 'news'
  | 'reviews'
  | 'faq'
  | 'coaches'
  | 'cta'

export interface HomeBlockStatus {
  key: HomeBlockKey
  label: string
  description: string
  enabled: boolean
  sortOrder: number
  contentKey?: SiteSectionKey
  visible: boolean
}

export interface LeadPurchaseItem {
  mediaId: string
  title: string
  sku?: string | null
  category?: string | null
  description?: string | null
  imageUrl?: string | null
  unitPrice: number
  qty: number
}

export interface Lead {
  id: string
  name: string
  phone: string
  phoneNorm?: string | null
  age?: string | null
  childName?: string | null
  message?: string | null
  source?: string | null
  location?: string | null
  program?: string | null
  variant?: string | null
  guestToken?: string | null
  items?: LeadPurchaseItem[] | null
  status: LeadStatus
  assigneeId?: string | null
  assignee?: LeadAssignee | null
  handledAt?: string | null
  nextContactAt?: string | null
  lostReason?: string | null
  note?: string | null
  createdAt: string
  updatedAt: string
  activities?: LeadActivity[]
  relatedLeads?: RelatedLead[]
}

export type LeadSortField =
  | 'createdAt'
  | 'name'
  | 'phone'
  | 'source'
  | 'status'
  | 'nextContactAt'

export interface LeadsMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  sort: LeadSortField
  order: 'asc' | 'desc'
}

export interface LeadsPage {
  items: Lead[]
  meta: LeadsMeta
}

export interface DashboardStats {
  newLeads: number
  inProgress?: number
  callbacksToday?: number
  callbacksOverdue?: number
  coaches: number
  media: {
    catalog: number
    news: number
    reviews: number
    gallery: number
  }
}

export interface CrmKpiManager {
  id: string
  email: string
  name: string
  assigned: number
  trial: number
  enrolled: number
  lost: number
  conversionEnrolled: number
  avgReactionMinutes: number | null
  overdue: number
}

export interface CrmKpi {
  range: StatsRange
  from: string
  to: string
  summary: {
    total: number
    byStatus: Record<string, number>
    trial: number
    enrolled: number
    lost: number
    closed: number
    conversionTrial: number
    conversionEnrolled: number
    avgReactionMinutes: number | null
    medianReactionMinutes: number | null
    callbacksToday: number
    callbacksOverdue: number
  }
  managers: CrmKpiManager[]
}

export type StatsRange = 'day' | 'week' | 'month' | 'year' | 'all'

export interface StatsSeriesPoint {
  key: string
  label: string
  total: number
  new: number
  done: number
}

export interface StatsSeries {
  range: StatsRange
  bucket: 'hour' | 'day' | 'month'
  from: string
  to: string
  points: StatsSeriesPoint[]
  totals: {
    total: number
    new: number
    done: number
  }
}

export interface NotificationLead {
  id: string
  name: string
  phone: string
  source?: string | null
  createdAt: string
  status: LeadStatus
}

export interface NotificationsPayload {
  newLeads: number
  latest: NotificationLead[]
  callbacksToday: number
  callbacksOverdue: number
  /** Перезвоны на сегодня, у которых уже подошло время */
  dueNow: number
}
