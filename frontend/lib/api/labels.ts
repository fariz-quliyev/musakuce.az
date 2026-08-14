import type {
  ClassifiedCategory,
  CulturalHeritageKind,
  EducationKind,
  EventCategory,
  ListingStatus,
  LocalInfoKind,
  MemorialCategory,
  ModerationStatus,
  PersonCategory,
  PhotoCategory,
  PlaceCategory,
  PlaceKind,
  PublicationStatus,
  SourceStatus,
  SubmissionKind,
  SubmissionStatus,
  VideoEmbedProvider,
} from "./types";

export const classifiedCategoryLabels: Record<ClassifiedCategory, string> = {
  AlqiSatqi: "Alqı-satqı",
  MalQara: "Mal-qara",
  KendTesserrufatiMehsullari: "Kənd təsərrüfatı məhsulları",
  Texnika: "Texnika",
  Avtomobil: "Avtomobil",
  Xidmet: "Xidmət",
  Is: "İş",
  Axtarilir: "Axtarılır",
  ItirilmisTapilmis: "İtirilmiş-tapılmış",
};

export const eventCategoryLabels: Record<EventCategory, string> = {
  School: "Məktəb",
  Sports: "İdman",
  Meeting: "Görüş",
  Celebration: "Mərasim",
  Community: "İcma",
  Other: "Digər",
};

export const placeKindLabels: Record<PlaceKind, string> = {
  Historical: "Tarixi yer",
  Useful: "Faydalı məkan",
};

export const placeCategoryLabels: Record<PlaceCategory, string> = {
  Mosque: "Məscid",
  Shrine: "Ocaq",
  Cemetery: "Qəbiristanlıq",
  School: "Məktəb",
  Library: "Kitabxana",
  Shop: "Mağaza",
  Pharmacy: "Aptek",
  Doctor: "Həkim",
  TeaHouse: "Çayxana",
  SportsArea: "İdman meydançası",
  Service: "Xidmət",
  Other: "Digər",
};

export const personCategoryLabels: Record<PersonCategory, string> = {
  Scientist: "Alim",
  Teacher: "Müəllim",
  Lawyer: "Hüquqşünas",
  Official: "Dövlət xadimi",
  ReligiousFigure: "Din xadimi",
  WriterPoet: "Şair, yazıçı",
  Athlete: "İdmançı",
  AgriculturalWorker: "Əmək adamı",
  Entrepreneur: "Sahibkar",
  Other: "Digər",
};

export const photoCategoryLabels: Record<PhotoCategory, string> = {
  KohneMusakuce: "Köhnə Musaküçə",
  Insanlarimiz: "İnsanlarımız",
  Mektab: "Məktəb",
  Mezunlar: "Məzunlar",
  Toylar: "Toylar",
  Merasimler: "Mərasimlər",
  KendHeyati: "Kənd həyatı",
  Sovxoz: "Sovxoz",
  Mescid: "Məscid",
  Tebiet: "Təbiət",
  KendMenzereleri: "Kənd mənzərələri",
  MuasirMusakuce: "Müasir Musaküçə",
};

export const localInfoKindLabels: Record<LocalInfoKind, string> = {
  Service: "Xidmət",
  Contact: "Faydalı əlaqə",
  Shop: "Mağaza",
  Craftsman: "Usta",
  Transport: "Nəqliyyat",
  Recommendation: "Tövsiyə",
};

export const moderationStatusLabels: Record<ModerationStatus, string> = {
  Pending: "Gözləmədə",
  Approved: "Təsdiqlənib",
  Rejected: "Rədd edilib",
};

export const publicationStatusLabels: Record<PublicationStatus, string> = {
  Draft: "Qaralama",
  Published: "Dərc edilib",
  Archived: "Arxivləşdirilib",
};

export const listingStatusLabels: Record<ListingStatus, string> = {
  Active: "Aktiv",
  Fulfilled: "Satılıb / Tamamlanıb",
  Expired: "Vaxtı bitib",
  Removed: "Silinib",
};

export const submissionStatusLabels: Record<SubmissionStatus, string> = {
  Pending: "Gözləmədə",
  Approved: "Təsdiqlənib",
  Rejected: "Rədd edilib",
  Converted: "Arxivə əlavə edilib",
  Archived: "Arxivləşdirilib",
};

export const submissionKindLabels: Record<SubmissionKind, string> = {
  Photo: "Foto",
  Video: "Video",
  Memory: "Xatirə",
  HistoricalInfo: "Tarixi məlumat",
};

export const videoEmbedProviderLabels: Record<VideoEmbedProvider, string> = {
  YouTube: "YouTube",
  Vimeo: "Vimeo",
  SelfHosted: "Öz serverimiz",
};

export const memorialCategoryLabels: Record<MemorialCategory, string> = {
  WWIIParticipant: "İkinci Dünya müharibəsi iştirakçısı",
  WWIIFallen: "İkinci Dünya müharibəsində həlak olub",
  KarabakhMartyr: "Qarabağ müharibəsi şəhidi",
  KarabakhParticipant: "Qarabağ müharibəsi iştirakçısı",
  WarDisabled: "Müharibə əlili",
  ChernobylDisabled: "Çernobıl əlili",
  LaborHero: "Əmək qəhrəmanı",
  SocialistLaborHero: "Sosialist Əməyi Qəhrəmanı",
  Other: "Digər",
};

export const culturalHeritageKindLabels: Record<CulturalHeritageKind, string> = {
  Tradition: "Ənənə",
  Craft: "Sənətkarlıq",
  Folklore: "Folklor",
  LocalExpression: "Yerli deyim",
  Cuisine: "Mətbəx",
  Custom: "Adət",
  OralHistory: "Şifahi tarix",
  CulturalObject: "Mədəni əşya",
  Story: "Hekayə",
  Other: "Digər",
};

export const educationKindLabels: Record<EducationKind, string> = {
  SchoolHistory: "Məktəbin tarixi",
  ImportantDate: "Mühüm tarix",
  FirstSchool: "İlk məktəb",
  FirstTeacher: "İlk müəllim",
  NotableTeacher: "Tanınmış müəllim",
  NotableGraduate: "Tanınmış məzun",
  Achievement: "Nailiyyət",
  Institution: "Təhsil müəssisəsi",
  Story: "Hekayə",
  Other: "Digər",
};

export const sourceStatusLabels: Record<SourceStatus, string> = {
  Verified: "Təsdiqlənib",
  OfficialSource: "Rəsmi mənbə",
  FamilyArchive: "Ailə arxivi",
  OralHistory: "Şifahi tarix",
  LocalResearch: "Yerli araşdırma",
  TraditionalStory: "Rəvayət",
  UnderResearch: "Araşdırılır",
};
