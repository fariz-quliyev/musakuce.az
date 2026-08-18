/**
 * TypeScript mirrors of the backend DTOs (see backend/Musakuce.Application).
 * Enum values are the exact C# member names — the API serializes enums as
 * strings via JsonStringEnumConverter, e.g. "AlqiSatqi", "Published".
 * Keep these in sync with the backend DTOs by hand for now; codegen from
 * the OpenAPI spec is a reasonable later upgrade, not needed for MVP.
 */

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PagedQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

// ---- Shared enums -----------------------------------------------------

export type ModerationStatus = "Pending" | "Approved" | "Rejected";
export type PublicationStatus = "Draft" | "Published" | "Archived";
export type ListingStatus = "Active" | "Fulfilled" | "Expired" | "Removed";
export type SubmissionStatus = "Pending" | "Approved" | "Rejected" | "Converted" | "Archived";
export type SourceStatus =
  | "Verified"
  | "OfficialSource"
  | "FamilyArchive"
  | "OralHistory"
  | "LocalResearch"
  | "TraditionalStory"
  | "UnderResearch";

// ---- Listings (Elanlar) ------------------------------------------------

export type ClassifiedCategory =
  | "AlqiSatqi"
  | "MalQara"
  | "KendTesserrufatiMehsullari"
  | "Texnika"
  | "Avtomobil"
  | "Xidmet"
  | "Is"
  | "Axtarilir"
  | "ItirilmisTapilmis";

export interface ListingDto {
  id: string;
  title: string;
  description: string;
  category: ClassifiedCategory;
  price: number | null;
  location: string;
  contactName: string;
  contactInfo: string;
  listingStatus: ListingStatus;
  moderationStatus: ModerationStatus;
  /** Set by admin/editor when moderationStatus is Rejected. */
  rejectionReason: string | null;
  postedAt: string;
  expiresAt: string;
  imageUrls: string[];
}

export interface CreateListingRequest {
  title: string;
  description: string;
  category: ClassifiedCategory;
  price?: number | null;
  location: string;
  contactName: string;
  contactInfo: string;
  imageUrls?: string[];
}

/** ADMIN-PRIVILEGED — full field edit. */
export type UpdateListingRequest = CreateListingRequest;

/** ADMIN-PRIVILEGED — at least one of moderationStatus/listingStatus should be supplied. */
export interface UpdateListingStatusRequest {
  moderationStatus?: ModerationStatus;
  listingStatus?: ListingStatus;
  /** Required by the backend when moderationStatus is "Rejected". */
  rejectionReason?: string | null;
}

export interface ListingQuery extends PagedQuery {
  category?: ClassifiedCategory;
  listingStatus?: ListingStatus;
  moderationStatus?: ModerationStatus;
  /** "newest" (default) | "priceAsc" | "priceDesc" */
  sortBy?: string;
}

// ---- Events (Təqvim) ----------------------------------------------------

export type EventCategory = "School" | "Sports" | "Meeting" | "Celebration" | "Community" | "Other";

export interface EventDto {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  startsAt: string;
  endsAt: string | null;
  location: string;
  placeId: string | null;
  organizerName: string | null;
  coverMediaAssetId: string | null;
  coverImageUrl: string | null;
  publicationStatus: PublicationStatus;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  category: EventCategory;
  startsAt: string;
  endsAt?: string | null;
  location: string;
  placeId?: string | null;
  organizerName?: string | null;
  coverMediaAssetId?: string | null;
}

/** ADMIN-PRIVILEGED — full field edit. */
export type UpdateEventRequest = CreateEventRequest;

/** ADMIN-PRIVILEGED — publish/unpublish/archive ("delete" is modeled as Archived). */
export interface UpdateEventStatusRequest {
  publicationStatus: PublicationStatus;
}

export interface EventQuery extends PagedQuery {
  category?: EventCategory;
  publicationStatus?: PublicationStatus;
  from?: string;
  to?: string;
}

// ---- Local info (Yerli Faydalı Məlumatlar) ------------------------------

export type LocalInfoKind = "Service" | "Contact" | "Shop" | "Craftsman" | "Transport" | "Recommendation";

export interface LocalInfoEntryDto {
  id: string;
  name: string;
  kind: LocalInfoKind;
  category: string;
  description: string | null;
  contactInfo: string | null;
  areaServed: string | null;
  photoMediaAssetId: string | null;
  photoUrl: string | null;
  attachedToEntryId: string | null;
  publicationStatus: PublicationStatus;
}

export interface LocalInfoQuery extends PagedQuery {
  kind?: LocalInfoKind;
  publicationStatus?: PublicationStatus;
}

/** ADMIN-PRIVILEGED — staff-only, spec §11 has no public submission form for this directory. */
export interface CreateLocalInfoEntryRequest {
  name: string;
  kind: LocalInfoKind;
  category: string;
  description?: string | null;
  contactInfo?: string | null;
  areaServed?: string | null;
  photoMediaAssetId?: string | null;
  attachedToEntryId?: string | null;
}

/** ADMIN-PRIVILEGED — full field edit. */
export type UpdateLocalInfoEntryRequest = CreateLocalInfoEntryRequest;

/** ADMIN-PRIVILEGED. */
export interface UpdateLocalInfoStatusRequest {
  publicationStatus: PublicationStatus;
}

// ---- Places (Xəritə) -----------------------------------------------------

export type PlaceKind = "Historical" | "Useful";
export type PlaceCategory =
  | "Mosque"
  | "Shrine"
  | "Cemetery"
  | "School"
  | "Library"
  | "Shop"
  | "Pharmacy"
  | "Doctor"
  | "TeaHouse"
  | "SportsArea"
  | "Service"
  | "Other";

export interface PlaceDto {
  id: string;
  name: string;
  slug: string;
  kind: PlaceKind;
  category: PlaceCategory | null;
  description: string | null;
  historicalBackground: string | null;
  latitude: number;
  longitude: number;
  coverMediaAssetId: string | null;
  coverImageUrl: string | null;
  sourceStatus: SourceStatus | null;
  sourceReference: string | null;
  /** Present only for a privileged, authenticated staff viewer — never public. */
  editorialNote: string | null;
  /** Present only for a privileged, authenticated staff viewer — never public. */
  originalSourceText: string | null;
  publicationStatus: PublicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceQuery extends PagedQuery {
  kind?: PlaceKind;
  category?: PlaceCategory;
  publicationStatus?: PublicationStatus;
}

/** ADMIN-PRIVILEGED. */
export interface CreatePlaceRequest {
  name: string;
  kind: PlaceKind;
  category: PlaceCategory;
  description?: string | null;
  historicalBackground?: string | null;
  latitude: number;
  longitude: number;
  coverMediaAssetId?: string | null;
  sourceStatus?: SourceStatus | null;
  sourceReference?: string | null;
  /** ADMIN-ONLY editorial working note — never public. */
  editorialNote?: string | null;
  /** ADMIN-ONLY original source wording — never public. */
  originalSourceText?: string | null;
}

/** ADMIN-PRIVILEGED — full field edit. */
export type UpdatePlaceRequest = CreatePlaceRequest;

/** ADMIN-PRIVILEGED — publish/unpublish/archive. */
export interface UpdatePlaceStatusRequest {
  publicationStatus: PublicationStatus;
}

// ---- People (İnsanlarımız) ------------------------------------------------

export type PersonCategory =
  | "Scientist"
  | "Teacher"
  | "Lawyer"
  | "Official"
  | "ReligiousFigure"
  | "WriterPoet"
  | "Athlete"
  | "AgriculturalWorker"
  | "Entrepreneur"
  | "Other";

export interface PersonDto {
  id: string;
  firstName: string;
  lastName: string;
  fatherName: string | null;
  birthDate: string | null;
  deathDate: string | null;
  category: PersonCategory;
  occupation: string | null;
  biography: string;
  coverMediaAssetId: string | null;
  coverImageUrl: string | null;
  sourceStatus: SourceStatus;
  sourceReference: string | null;
  /** Present only for a privileged, authenticated staff viewer — never public. */
  editorialNote: string | null;
  /** Present only for a privileged, authenticated staff viewer — never public. */
  originalSourceText: string | null;
  slug: string;
  publicationStatus: PublicationStatus;
}

export interface PersonQuery extends PagedQuery {
  category?: PersonCategory;
  publicationStatus?: PublicationStatus;
}

/** ADMIN-PRIVILEGED — no public account/self-submission functionality. */
export interface CreatePersonRequest {
  firstName: string;
  lastName: string;
  fatherName?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  category: PersonCategory;
  occupation?: string | null;
  biography: string;
  coverMediaAssetId?: string | null;
  sourceStatus?: SourceStatus;
  sourceReference?: string | null;
  /** ADMIN-ONLY editorial working note — never public. */
  editorialNote?: string | null;
  /** ADMIN-ONLY original source wording — never public. */
  originalSourceText?: string | null;
}

/** ADMIN-PRIVILEGED — full field edit. */
export type UpdatePersonRequest = CreatePersonRequest;

/** ADMIN-PRIVILEGED. */
export interface UpdatePersonStatusRequest {
  publicationStatus: PublicationStatus;
}

// ---- History (Kəndimizin tarixi) ------------------------------------------

export interface HistoricalEventImageDto {
  id: string;
  mediaAssetId: string;
  imageUrl: string;
  sortOrder: number;
}

export interface HistoricalEventDto {
  id: string;
  title: string;
  period: string;
  eventDate: string | null;
  description: string;
  /** Optional expanded write-up, shown in the timeline's detail panel below `description` when present. */
  detailedText: string | null;
  sourceStatus: SourceStatus;
  /** Free-text citation — e.g. "Ailə arxivi, Səlim baba ilə söhbət, 2020". */
  sourceReference: string | null;
  /** Present only for a privileged, authenticated staff viewer — never public. */
  editorialNote: string | null;
  /** Present only for a privileged, authenticated staff viewer — never public. */
  originalSourceText: string | null;
  displayOrder: number;
  publicationStatus: PublicationStatus;
  coverMediaAssetId: string | null;
  coverImageUrl: string | null;
  /** Distinct from publicationStatus — a Published event can still be excluded from the curated /kendimiz timeline without unpublishing it. */
  showInTimeline: boolean;
  /** True only for the sample rows seeded by the AddHistoryTimelineFeature migration — a provenance marker for the admin UI, never used to filter what's shown publicly. */
  isDefault: boolean;
  /** Admin-picked timeline marker category — never inferred from title/description text. Used as the marker glyph only when iconImageUrl is null. */
  eventIcon: EventIcon;
  iconMediaAssetId: string | null;
  /** Optional custom marker image — overrides eventIcon on the timeline marker when present. */
  iconImageUrl: string | null;
  additionalImages: HistoricalEventImageDto[];
}

export type EventIcon =
  | "Settlement"
  | "Religion"
  | "Education"
  | "People"
  | "War"
  | "Agriculture"
  | "Achievement"
  | "Flag"
  | "Culture"
  | "Document"
  | "General";

export interface HistoricalEventQuery extends PagedQuery {
  publicationStatus?: PublicationStatus;
}

/** ADMIN-PRIVILEGED. */
export interface CreateHistoricalEventRequest {
  title: string;
  period: string;
  eventDate?: string | null;
  description: string;
  detailedText?: string | null;
  sourceStatus?: SourceStatus;
  sourceReference?: string | null;
  /** ADMIN-ONLY editorial working note — never public. */
  editorialNote?: string | null;
  /** ADMIN-ONLY original source wording — never public. */
  originalSourceText?: string | null;
  displayOrder?: number;
  coverMediaAssetId?: string | null;
  showInTimeline?: boolean;
  eventIcon?: EventIcon;
  iconMediaAssetId?: string | null;
  /** Already-uploaded MediaAsset ids, in display order — replaces the event's whole additional-images list on every create/update. */
  additionalImageMediaAssetIds?: string[];
}

/** ADMIN-PRIVILEGED — full field edit. */
export type UpdateHistoricalEventRequest = CreateHistoricalEventRequest;

/** ADMIN-PRIVILEGED. */
export interface UpdateHistoricalEventStatusRequest {
  publicationStatus: PublicationStatus;
}

// ---- Timeline settings (Kəndin tarixi — "Zaman xəttində Musaküçə") --------

export interface TimelineSettingsDto {
  id: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  /** Null = show every active/published event, no cap. */
  maxEventsDesktop: number | null;
  /** "First" or "Last" — which event is pre-selected on first render. */
  defaultSelection: "First" | "Last";
  /** Reserved for a future alternate mobile layout — only "HorizontalScroll" is implemented today. */
  mobileBehavior: string;
}

/** ADMIN-PRIVILEGED — always upserts the single timeline-settings row. */
export interface UpsertTimelineSettingsRequest {
  title: string;
  subtitle: string;
  isActive: boolean;
  maxEventsDesktop?: number | null;
  defaultSelection: "First" | "Last";
  mobileBehavior: string;
}

// ---- Photos (Fotoarxiv) ----------------------------------------------------

export type PhotoCategory =
  | "KohneMusakuce"
  | "Insanlarimiz"
  | "Mektab"
  | "Mezunlar"
  | "Toylar"
  | "Merasimler"
  | "KendHeyati"
  | "Sovxoz"
  | "Mescid"
  | "Tebiet"
  | "KendMenzereleri"
  | "MuasirMusakuce";

export interface PhotoDto {
  id: string;
  title: string;
  takenDate: string | null;
  location: string | null;
  description: string | null;
  story: string | null;
  category: PhotoCategory;
  sourceStatus: SourceStatus;
  uploaderName: string | null;
  mediaAssetId: string;
  imageUrl: string;
  altText: string | null;
  publicationStatus: PublicationStatus;
}

export interface PhotoQuery extends PagedQuery {
  category?: PhotoCategory;
  publicationStatus?: PublicationStatus;
}

/** ADMIN-PRIVILEGED — references a MediaAsset already created via
 * POST /api/media/upload (Phase 8's real upload pipeline). */
export interface CreatePhotoRequest {
  title: string;
  takenDate?: string | null;
  location?: string | null;
  description?: string | null;
  story?: string | null;
  category: PhotoCategory;
  sourceStatus?: SourceStatus;
  uploaderName?: string | null;
  mediaAssetId: string;
  altText?: string | null;
}

/** ADMIN-PRIVILEGED — full field edit. */
export type UpdatePhotoRequest = CreatePhotoRequest;

/** ADMIN-PRIVILEGED. */
export interface UpdatePhotoStatusRequest {
  publicationStatus: PublicationStatus;
}

// ---- Videos ----------------------------------------------------------------

export type VideoEmbedProvider = "YouTube" | "Vimeo" | "SelfHosted";

export interface VideoDto {
  id: string;
  title: string;
  description: string | null;
  embedProvider: VideoEmbedProvider;
  embedUrlOrKey: string;
  thumbnailMediaAssetId: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  recordedDate: string | null;
  sourceStatus: SourceStatus;
  publicationStatus: PublicationStatus;
}

export interface VideoQuery extends PagedQuery {
  publicationStatus?: PublicationStatus;
}

/** ADMIN-PRIVILEGED — no upload, embedded URLs only. */
export interface CreateVideoRequest {
  title: string;
  description?: string | null;
  embedProvider: VideoEmbedProvider;
  embedUrlOrKey: string;
  thumbnailMediaAssetId?: string | null;
  category?: string | null;
  recordedDate?: string | null;
  sourceStatus?: SourceStatus;
}

/** ADMIN-PRIVILEGED — full field edit. */
export type UpdateVideoRequest = CreateVideoRequest;

/** ADMIN-PRIVILEGED. */
export interface UpdateVideoStatusRequest {
  publicationStatus: PublicationStatus;
}

// ---- Community submissions (Musaküçənin yaddaşına sən də əlavə et) --------

export type SubmissionKind = "Photo" | "Video" | "Memory" | "HistoricalInfo";

export interface SubmissionDto {
  id: string;
  submitterName: string;
  contactInfo: string;
  kind: SubmissionKind;
  description: string;
  suggestedDate: string | null;
  suggestedLocation: string | null;
  peopleShown: string | null;
  sourceNote: string | null;
  permissionToPublish: boolean;
  status: SubmissionStatus;
  reviewerNote: string | null;
  createdAt: string;
  fileUrls: string[];
}

export interface CreateSubmissionRequest {
  submitterName: string;
  contactInfo: string;
  kind: SubmissionKind;
  description: string;
  suggestedDate?: string | null;
  suggestedLocation?: string | null;
  peopleShown?: string | null;
  sourceNote?: string | null;
  permissionToPublish: boolean;
  fileUrls?: string[];
}

/** ADMIN-PRIVILEGED — the moderation inbox listing, incl. contact info. */
export interface SubmissionQuery extends PagedQuery {
  kind?: SubmissionKind;
  status?: SubmissionStatus;
}

/** ADMIN-PRIVILEGED — approve/reject/archive. */
export interface UpdateSubmissionStatusRequest {
  status: SubmissionStatus;
  reviewerNote?: string | null;
}

// ---- Media (Phase 8) ----------------------------------------------------------

export type MediaType = "Image" | "Video" | "Document";

export interface MediaAssetDto {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  originalUrl: string | null;
  originalFileName: string | null;
  altText: string | null;
  contentType: string | null;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  mediaType: MediaType;
  createdAt: string;
}

// ---- Auth / admin users (Phase 7) --------------------------------------------

export interface CurrentUserDto {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: CurrentUserDto;
}

export type AdminRole = "Administrator" | "Editor" | "Archivist" | "Moderator";

export interface AdminUserDto {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  isLockedOut: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  displayName: string;
  role: AdminRole;
  temporaryPassword: string;
}

export interface AssignRoleRequest {
  role: AdminRole;
}

export interface SetActiveRequest {
  isActive: boolean;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

// ---- Audit log (Phase 7) ------------------------------------------------------

export interface AuditLogEntryDto {
  id: string;
  timestamp: string;
  actorUserId: string | null;
  actorEmail: string | null;
  actorDisplayName: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface AuditLogQuery extends PagedQuery {
  actorUserId?: string;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
}

// ---- Search -----------------------------------------------------------------

export interface SearchResultItem {
  id: string;
  title: string;
  snippet: string | null;
}

export interface SearchResponse {
  people: SearchResultItem[];
  history: SearchResultItem[];
  photos: SearchResultItem[];
  videos: SearchResultItem[];
  places: SearchResultItem[];
  events: SearchResultItem[];
  localInfo: SearchResultItem[];
  memorial: SearchResultItem[];
  culturalHeritage: SearchResultItem[];
  interviews: SearchResultItem[];
  education: SearchResultItem[];
}

// ---- Village profile (Kəndimiz — Phase 12) -------------------------------

export interface VillageProfileDto {
  id: string;
  villageName: string;
  tagline: string | null;
  shortDescription: string;
  longDescription: string | null;
  population: number | null;
  populationAsOfYear: number | null;
  areaHectares: number | null;
  geographicalDescription: string | null;
  mainOccupations: string | null;
  neighboringSettlements: string | null;
  nameOriginNarrative: string | null;
  nameOriginSourceStatus: SourceStatus | null;
  nameOriginSourceReference: string | null;
  latitude: number | null;
  longitude: number | null;
  heroMediaAssetId: string | null;
  heroImageUrl: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  logoMediaAssetId: string | null;
  logoImageUrl: string | null;
  contactInfo: string | null;
  socialLinks: string | null;
  /** Present only for a privileged, authenticated staff viewer — never public. */
  editorialNote: string | null;
  publicationStatus: PublicationStatus;
  updatedAt: string;
}

/** ADMIN-PRIVILEGED — upserts the single village-profile row. */
export interface UpsertVillageProfileRequest {
  villageName: string;
  tagline?: string | null;
  shortDescription: string;
  longDescription?: string | null;
  population?: number | null;
  populationAsOfYear?: number | null;
  areaHectares?: number | null;
  geographicalDescription?: string | null;
  mainOccupations?: string | null;
  neighboringSettlements?: string | null;
  nameOriginNarrative?: string | null;
  nameOriginSourceStatus?: SourceStatus | null;
  nameOriginSourceReference?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  heroMediaAssetId?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  logoMediaAssetId?: string | null;
  contactInfo?: string | null;
  socialLinks?: string | null;
  /** ADMIN-ONLY editorial working note — never public. */
  editorialNote?: string | null;
}

export interface UpdateVillageProfileStatusRequest {
  publicationStatus: PublicationStatus;
}

// ---- Memorial (Xatirə — Phase 12) ----------------------------------------

export type MemorialCategory =
  | "WWIIParticipant"
  | "WWIIFallen"
  | "KarabakhMartyr"
  | "KarabakhParticipant"
  | "WarDisabled"
  | "ChernobylDisabled"
  | "LaborHero"
  | "SocialistLaborHero"
  | "Other";

export interface MemorialRecordDto {
  id: string;
  fullName: string;
  fatherName: string | null;
  category: MemorialCategory;
  birthDate: string | null;
  deathDate: string | null;
  biography: string | null;
  achievements: string | null;
  coverMediaAssetId: string | null;
  coverImageUrl: string | null;
  relatedPersonId: string | null;
  sourceStatus: SourceStatus;
  sourceReference: string | null;
  /** Present only for a privileged, authenticated staff viewer — never public. */
  editorialNote: string | null;
  /** Present only for a privileged, authenticated staff viewer — never public. */
  originalSourceText: string | null;
  publicationStatus: PublicationStatus;
}

export interface MemorialRecordQuery extends PagedQuery {
  category?: MemorialCategory;
  publicationStatus?: PublicationStatus;
}

/** ADMIN-PRIVILEGED. */
export interface CreateMemorialRecordRequest {
  fullName: string;
  fatherName?: string | null;
  category: MemorialCategory;
  birthDate?: string | null;
  deathDate?: string | null;
  biography?: string | null;
  achievements?: string | null;
  coverMediaAssetId?: string | null;
  relatedPersonId?: string | null;
  sourceStatus?: SourceStatus;
  sourceReference?: string | null;
  /** ADMIN-ONLY editorial working note — never public. */
  editorialNote?: string | null;
  /** ADMIN-ONLY original source wording — never public. */
  originalSourceText?: string | null;
}

/** ADMIN-PRIVILEGED — full field edit. */
export type UpdateMemorialRecordRequest = CreateMemorialRecordRequest;

export interface UpdateMemorialRecordStatusRequest {
  publicationStatus: PublicationStatus;
}

// ---- Cultural heritage (Mədəni irs — Phase 12) ---------------------------

export type CulturalHeritageKind =
  | "Tradition"
  | "Craft"
  | "Folklore"
  | "LocalExpression"
  | "Cuisine"
  | "Custom"
  | "OralHistory"
  | "CulturalObject"
  | "Story"
  | "Other";

export interface CulturalHeritageItemDto {
  id: string;
  title: string;
  kind: CulturalHeritageKind;
  description: string;
  coverMediaAssetId: string | null;
  coverImageUrl: string | null;
  sourceStatus: SourceStatus;
  sourceReference: string | null;
  /** Present only for a privileged, authenticated staff viewer — never public. */
  editorialNote: string | null;
  /** Present only for a privileged, authenticated staff viewer — never public. */
  originalSourceText: string | null;
  publicationStatus: PublicationStatus;
}

export interface CulturalHeritageItemQuery extends PagedQuery {
  kind?: CulturalHeritageKind;
  publicationStatus?: PublicationStatus;
}

/** ADMIN-PRIVILEGED. */
export interface CreateCulturalHeritageItemRequest {
  title: string;
  kind: CulturalHeritageKind;
  description: string;
  coverMediaAssetId?: string | null;
  sourceStatus?: SourceStatus;
  sourceReference?: string | null;
  /** ADMIN-ONLY editorial working note — never public. */
  editorialNote?: string | null;
  /** ADMIN-ONLY original source wording — never public. */
  originalSourceText?: string | null;
}

/** ADMIN-PRIVILEGED — full field edit. */
export type UpdateCulturalHeritageItemRequest = CreateCulturalHeritageItemRequest;

export interface UpdateCulturalHeritageItemStatusRequest {
  publicationStatus: PublicationStatus;
}

// ---- Interviews (Kəndimizin səsi — Phase 12) -----------------------------

export interface InterviewDto {
  id: string;
  personName: string;
  relatedPersonId: string | null;
  title: string | null;
  description: string | null;
  transcript: string | null;
  embedProvider: VideoEmbedProvider;
  embedUrlOrKey: string;
  thumbnailMediaAssetId: string | null;
  thumbnailImageUrl: string | null;
  recordingDate: string | null;
  sourceStatus: SourceStatus;
  sourceReference: string | null;
  /** Present only for a privileged, authenticated staff viewer — never public. */
  editorialNote: string | null;
  /** Present only for a privileged, authenticated staff viewer — never public. */
  originalSourceText: string | null;
  publicationStatus: PublicationStatus;
}

export interface InterviewQuery extends PagedQuery {
  publicationStatus?: PublicationStatus;
}

/** ADMIN-PRIVILEGED. */
export interface CreateInterviewRequest {
  personName: string;
  relatedPersonId?: string | null;
  title?: string | null;
  description?: string | null;
  transcript?: string | null;
  embedProvider: VideoEmbedProvider;
  embedUrlOrKey: string;
  thumbnailMediaAssetId?: string | null;
  recordingDate?: string | null;
  sourceStatus?: SourceStatus;
  sourceReference?: string | null;
  /** ADMIN-ONLY editorial working note — never public. */
  editorialNote?: string | null;
  /** ADMIN-ONLY original source wording — never public. */
  originalSourceText?: string | null;
}

/** ADMIN-PRIVILEGED — full field edit. */
export type UpdateInterviewRequest = CreateInterviewRequest;

export interface UpdateInterviewStatusRequest {
  publicationStatus: PublicationStatus;
}

// ---- Education (Təhsil — Phase 13) ---------------------------------------

export type EducationKind =
  | "SchoolHistory"
  | "ImportantDate"
  | "FirstSchool"
  | "FirstTeacher"
  | "NotableTeacher"
  | "NotableGraduate"
  | "Achievement"
  | "Institution"
  | "Story"
  | "Other";

export interface EducationEntryDto {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  kind: EducationKind;
  period: string | null;
  eventDate: string | null;
  coverMediaAssetId: string | null;
  coverImageUrl: string | null;
  relatedPersonId: string | null;
  sourceStatus: SourceStatus;
  sourceReference: string | null;
  /** Present only for a privileged, authenticated staff viewer — never public. */
  editorialNote: string | null;
  /** Present only for a privileged, authenticated staff viewer — never public. */
  originalSourceText: string | null;
  publicationStatus: PublicationStatus;
}

export interface EducationEntryQuery extends PagedQuery {
  kind?: EducationKind;
  publicationStatus?: PublicationStatus;
}

/** ADMIN-PRIVILEGED. */
export interface CreateEducationEntryRequest {
  title: string;
  summary?: string | null;
  content?: string | null;
  kind: EducationKind;
  period?: string | null;
  eventDate?: string | null;
  coverMediaAssetId?: string | null;
  relatedPersonId?: string | null;
  sourceStatus?: SourceStatus;
  sourceReference?: string | null;
  /** ADMIN-ONLY editorial working note — never public. */
  editorialNote?: string | null;
  /** ADMIN-ONLY original source wording — never public. */
  originalSourceText?: string | null;
}

/** ADMIN-PRIVILEGED — full field edit. */
export type UpdateEducationEntryRequest = CreateEducationEntryRequest;

export interface UpdateEducationEntryStatusRequest {
  publicationStatus: PublicationStatus;
}
