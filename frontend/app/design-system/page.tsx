import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardMedia,
  CardBody,
  CardTitle,
  CardDescription,
  CardMeta,
} from "@/components/ui/Card";
import { PhotoPlaceholder } from "@/components/ui/PhotoPlaceholder";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Radio } from "@/components/ui/Radio";
import { Skeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Dizayn sistemi — Musaküçə",
  robots: { index: false, follow: false },
};

const COLOR_GROUPS: { title: string; swatches: { name: string; className: string }[] }[] = [
  {
    title: "Səthlər (Surfaces)",
    swatches: [
      { name: "cream", className: "bg-cream" },
      { name: "cream-deep", className: "bg-cream-deep" },
      { name: "paper", className: "bg-paper border border-stone-light" },
      { name: "paper-soft", className: "bg-paper-soft border border-stone-light" },
    ],
  },
  {
    title: "Meşə yaşılı (Forest)",
    swatches: [
      { name: "forest", className: "bg-forest" },
      { name: "forest-dark", className: "bg-forest-dark" },
      { name: "forest-light", className: "bg-forest-light" },
      { name: "moss", className: "bg-moss" },
    ],
  },
  {
    title: "Torpaq (Terracotta)",
    swatches: [
      { name: "terracotta", className: "bg-terracotta" },
      { name: "terracotta-dark", className: "bg-terracotta-dark" },
      { name: "clay-light", className: "bg-clay-light" },
    ],
  },
  {
    title: "Günəş işığı (Gold)",
    swatches: [
      { name: "gold", className: "bg-gold" },
      { name: "gold-dark", className: "bg-gold-dark" },
      { name: "gold-light", className: "bg-gold-light" },
    ],
  },
  {
    title: "Daş (Stone / neutral)",
    swatches: [
      { name: "stone", className: "bg-stone" },
      { name: "stone-light", className: "bg-stone-light" },
      { name: "stone-dark", className: "bg-stone-dark" },
    ],
  },
  {
    title: "Xatirə (Memorial — calm)",
    swatches: [
      { name: "memorial-bg", className: "bg-memorial-bg" },
      { name: "memorial-surface", className: "bg-memorial-surface border border-memorial-line" },
      { name: "memorial-accent", className: "bg-memorial-accent" },
    ],
  },
  {
    title: "Status",
    swatches: [
      { name: "success", className: "bg-success" },
      { name: "warning", className: "bg-warning" },
      { name: "danger", className: "bg-danger" },
      { name: "info", className: "bg-info" },
    ],
  },
];

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-16 w-full rounded-md ${className}`} />
      <span className="text-xs text-ink-soft">{name}</span>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* Intro */}
        <Container as="section" className="py-16">
          <p className="mb-3 text-[length:var(--text-eyebrow)] font-semibold uppercase tracking-[var(--text-eyebrow--letter-spacing)] text-terracotta">
            Phase 2 — Dizayn Sistemi
          </p>
          <h1 className="font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-ink text-balance">
            Modern Heritage + Digital Village Square
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
            MUSAKÜÇƏ — BİZİM KƏND üçün vizual əsas: rəng palitrası,
            tipoqrafiya, boşluq, kölgə, düymə, nişan (badge), kart, naviqasiya,
            forma elementləri, yüklənmə və boş vəziyyət komponentləri. Bu
            səhifə daxili baxış üçündür — ana səhifə deyil.
          </p>
        </Container>

        {/* Typography */}
        <Container as="section" className="py-14 border-t border-stone-light">
          <SectionHeading
            eyebrow="Tipoqrafiya"
            title="Fraunces + Plus Jakarta Sans"
            description="Editorial, isti başlıq şrifti (Fraunces) və dostcasına, oxunaqlı mətn şrifti (Plus Jakarta Sans) — Azərbaycan hərfləri (ə, ğ, ı, ö, ş, ü, ç) daxil olmaqla."
            className="mb-10"
          />
          <div className="space-y-6">
            <p className="font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">
              Musaküçə — bizim kənd
            </p>
            <p className="font-display text-[length:var(--text-h1)] leading-[var(--text-h1--line-height)]">
              H1 — Kəndimizin tarixi
            </p>
            <p className="font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)]">
              H2 — Bu gün kənddə
            </p>
            <p className="font-display text-[length:var(--text-h3)] leading-[var(--text-h3--line-height)]">
              H3 — İnsanlarımız
            </p>
            <p className="font-display text-[length:var(--text-h4)] leading-[var(--text-h4--line-height)]">
              H4 — Bir foto, bir hekayə
            </p>
            <p className="text-lg leading-relaxed">
              Body-lg — Musaküçə haqqında tarix, insanlar, xatirələr və bu gün
              kənddə baş verənlər — bir yerdə.
            </p>
            <p className="text-base leading-relaxed text-ink-soft">
              Body — Şəkil, video, xatirə və tarixi məlumat göndərərək
              kəndimizin yaddaşını birlikdə qoruyaq.
            </p>
            <p className="text-sm text-ink-faint">
              Small — mənbə: Ailə arxivi, 1962
            </p>
            <p className="text-[length:var(--text-eyebrow)] font-semibold uppercase tracking-[var(--text-eyebrow--letter-spacing)] text-terracotta">
              Eyebrow label
            </p>
          </div>
        </Container>

        {/* Colors */}
        <Container as="section" className="py-14 border-t border-stone-light">
          <SectionHeading
            eyebrow="Rəng palitrası"
            title="Kənd yaşıllığı, torpaq, daş, günəş işığı"
            description="Korporativ mavi və xəbər-qırmızısı yoxdur. Xatirə palitrası isə qəsdən susdurulub — sayt boyu canlı vurğu rənglərindən ayrı saxlanılır."
            className="mb-10"
          />
          <div className="space-y-10">
            {COLOR_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="mb-3 text-sm font-semibold text-ink-soft">
                  {group.title}
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {group.swatches.map((s) => (
                    <Swatch key={s.name} {...s} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>

        {/* Radius & Shadow */}
        <Container as="section" className="py-14 border-t border-stone-light">
          <SectionHeading
            eyebrow="Radius və kölgə"
            title="Yumşaq, isti tonlu"
            description="Künclər cazibədar dərəcədə yumşaqdır; kölgələr soyuq boz yox, isti qəhvəyi tonda."
            className="mb-10"
          />
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
            {[
              ["sm", "rounded-sm"],
              ["md", "rounded-md"],
              ["lg", "rounded-lg"],
              ["xl", "rounded-xl"],
              ["full", "rounded-full"],
            ].map(([name, cls]) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <div className={`h-16 w-16 bg-forest-light ${cls}`} />
                <span className="text-xs text-ink-soft">radius-{name}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              ["sm", "shadow-sm"],
              ["md", "shadow-md"],
              ["lg", "shadow-lg"],
              ["photo", "shadow-photo"],
            ].map(([name, cls]) => (
              <div key={name} className="flex flex-col items-center gap-3 py-4">
                <div className={`h-16 w-16 rounded-lg bg-paper ${cls}`} />
                <span className="text-xs text-ink-soft">shadow-{name}</span>
              </div>
            ))}
          </div>
        </Container>

        {/* Buttons */}
        <Container as="section" className="py-14 border-t border-stone-light">
          <SectionHeading
            eyebrow="Düymələr"
            title="Buttons"
            className="mb-10"
          />
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">Kəndimizi tanı</Button>
            <Button variant="secondary">Bu gün kənddə</Button>
            <Button variant="outline">Ətraflı bax</Button>
            <Button variant="ghost">Ləğv et</Button>
            <Button variant="memorial">Xatirəyə keç</Button>
            <Button variant="primary" loading>
              Göndərilir…
            </Button>
            <Button variant="primary" disabled>
              Deaktiv
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button variant="primary" size="sm">
              Kiçik
            </Button>
            <Button variant="primary" size="md">
              Orta
            </Button>
            <Button variant="primary" size="lg">
              Böyük
            </Button>
          </div>
        </Container>

        {/* Badges */}
        <Container as="section" className="py-14 border-t border-stone-light">
          <SectionHeading eyebrow="Nişanlar" title="Badges" className="mb-10" />
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="neutral">Kənd həyatı</Badge>
            <Badge tone="forest" dot>
              Təsdiqlənib
            </Badge>
            <Badge tone="terracotta">Şifahi tarix</Badge>
            <Badge tone="gold">Seçilmiş</Badge>
            <Badge tone="success">Aktiv</Badge>
            <Badge tone="warning">Gözləmədə</Badge>
            <Badge tone="danger">Vaxtı bitib</Badge>
            <Badge tone="info">Araşdırılır</Badge>
            <Badge tone="memorial" dot>
              Xatirə
            </Badge>
          </div>
        </Container>

        {/* Cards */}
        <Container as="section" className="py-14 border-t border-stone-light">
          <SectionHeading
            eyebrow="Kartlar"
            title="Arxiv, Kənd Meydanı, Xatirə"
            description="Eyni ailədən üç variant — Xatirə heç vaxt digərləri kimi 'hover-lift' effekti almır."
            className="mb-10"
          />
          <div className="grid gap-6 sm:grid-cols-3">
            <Card variant="default">
              <CardMedia aspect="video">
                <PhotoPlaceholder tone="warm" label="Köhnə Musaküçə" />
              </CardMedia>
              <CardBody>
                <CardTitle>Bir foto — bir hekayə</CardTitle>
                <CardDescription>
                  1962-ci ildə çəkilmiş bu şəkil məktəbin ilk məzunlarını
                  göstərir.
                </CardDescription>
                <CardMeta>
                  <Badge tone="terracotta">Ailə arxivi</Badge>
                  <span>1962</span>
                </CardMeta>
              </CardBody>
            </Card>

            <Card variant="square">
              <CardMedia aspect="video">
                <PhotoPlaceholder tone="forest" label="Elan" />
              </CardMedia>
              <CardBody>
                <CardTitle>Kombayn xidməti</CardTitle>
                <CardDescription>
                  Payızlıq sahələr üçün kombayn xidməti — Musaküçə ərazisi.
                </CardDescription>
                <CardMeta>
                  <Badge tone="success">Aktiv</Badge>
                  <span>3 gün əvvəl</span>
                </CardMeta>
              </CardBody>
            </Card>

            <Card variant="memorial">
              <CardMedia aspect="square" className="max-w-40 mx-auto pt-6">
                <PhotoPlaceholder tone="memorial" label="Xatirə şəkli" />
              </CardMedia>
              <CardBody className="text-center">
                <CardTitle>Musa Əliyev</CardTitle>
                <CardDescription>1938 — 2024</CardDescription>
                <CardMeta className="justify-center">
                  <Badge tone="memorial">Xatirə</Badge>
                </CardMeta>
              </CardBody>
            </Card>
          </div>
        </Container>

        {/* Form controls */}
        <Container as="section" className="py-14 border-t border-stone-light">
          <SectionHeading
            eyebrow="Forma elementləri"
            title="Material göndərmə forması üçün əsas"
            className="mb-10"
          />
          <div className="grid max-w-xl gap-5">
            <FormField label="Ad, soyad" htmlFor="ds-name" required>
              <Input id="ds-name" placeholder="Adınızı yazın" />
            </FormField>
            <FormField
              label="Əlaqə"
              htmlFor="ds-contact"
              hint="Telefon və ya e-poçt"
            >
              <Input id="ds-contact" placeholder="+994…" />
            </FormField>
            <FormField
              label="Təsvir"
              htmlFor="ds-desc"
              error="Bu sahə boş buraxıla bilməz"
            >
              <Textarea id="ds-desc" placeholder="Material haqqında qısa məlumat" />
            </FormField>
            <FormField label="Kateqoriya" htmlFor="ds-category">
              <Select id="ds-category" defaultValue="">
                <option value="" disabled>
                  Seçin
                </option>
                <option>Köhnə foto</option>
                <option>Video</option>
                <option>Sənəd</option>
                <option>Xatirə</option>
              </Select>
            </FormField>
            <Checkbox
              id="ds-permission"
              label="Yayımlamaq üçün icazə verirəm"
              description="Materialınız moderatorun təsdiqindən sonra dərc olunacaq."
            />
            <div className="flex gap-6">
              <Radio id="ds-r1" name="ds-r" label="Bəli" defaultChecked />
              <Radio id="ds-r2" name="ds-r" label="Xeyr" />
            </div>
            <Button variant="primary" className="w-fit">
              Göndər
            </Button>
          </div>
        </Container>

        {/* Loading & empty states */}
        <Container as="section" className="py-14 border-t border-stone-light">
          <SectionHeading
            eyebrow="Vəziyyətlər"
            title="Yüklənmə və boş vəziyyət"
            className="mb-10"
          />
          <div className="grid gap-6 sm:grid-cols-3">
            <CardSkeleton />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
              <Skeleton className="h-3.5 w-3/5" />
            </div>
            <EmptyState
              title="Hələ heç nə yoxdur"
              description="Bu bölmədə hələ material əlavə edilməyib."
              action={<Button size="sm">Material göndər</Button>}
            />
          </div>
          <div className="mt-6 max-w-sm">
            <EmptyState
              tone="memorial"
              title="Xatirə tapılmadı"
              description="Axtardığınız xatirə səhifəsi mövcud deyil və ya arxivləşdirilib."
            />
          </div>
        </Container>

        {/* Accessible states */}
        <Container as="section" className="py-14 border-t border-stone-light">
          <SectionHeading
            eyebrow="Əlçatanlıq"
            title="Fokus vəziyyəti"
            description="Bütün interaktiv elementlərdə isti tonlu, aydın görünən fokus halqası (Tab düyməsi ilə sınayın)."
            className="mb-10"
          />
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Tab ilə fokuslanın</Button>
            <Input placeholder="Fokus nümunəsi" className="max-w-56" />
            <a href="#" className="self-center text-sm font-semibold text-forest underline underline-offset-4">
              Mətn keçidi
            </a>
          </div>
        </Container>

        <Container as="section" className="py-16 border-t border-stone-light">
          <p className="text-sm text-ink-faint">
            Breakpoints: xs 30rem · sm 40rem · md 48rem · lg 64rem · xl 80rem ·
            2xl 96rem — mobile-first, Tailwind v4 defaults + custom{" "}
            <code>xs</code>.
          </p>
        </Container>
      </main>
    </>
  );
}
