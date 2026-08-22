import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Məxfilik siyasəti",
  description: "Musaküçə.az-da hansı məlumatların toplandığı, necə istifadə olunduğu və qorunduğu haqqında.",
  path: "/mexfilik-siyaseti",
});

/**
 * Describes only what this site actually does — no analytics/ad
 * cookies exist to disclose (grepped: none), no user accounts for
 * visitors (only staff/admin login), so this stays honest and short
 * rather than a generic template full of clauses that don't apply
 * here. Update this alongside any future change to what's collected
 * (a new form field, an analytics tool, etc.).
 */
export default function PrivacyPolicyPage() {
  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <SectionHeading as="h1" eyebrow="Hüquqi" title="Məxfilik siyasəti" className="mb-10" />

        <div className="max-w-2xl space-y-8 text-base leading-relaxed text-ink-soft">
          <p>
            Musaküçə.az kəndimizin rəqəmsal yaddaşını və gündəlik həyatını əks etdirən icma saytıdır. Bu səhifə saytda
            hansı şəxsi məlumatların toplandığını, necə istifadə olunduğunu və kimlə paylaşılmadığını izah edir.
          </p>

          <section>
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">Hansı məlumatları toplayırıq</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium text-ink">Töhfə göndərişləri</span> (&ldquo;Foto göndər&rdquo;, &ldquo;Video göndər&rdquo;,
                &ldquo;Xatirə paylaş&rdquo;, &ldquo;Tarixi məlumat göndər&rdquo; — /paylas): göndərdiyiniz fayl/mətnlə yanaşı, istəyə bağlı
                olaraq ad-soyad və əlaqə (telefon/e-poçt) daxil edə bilərsiniz. Bunlar tələb olunmur.
              </li>
              <li>
                <span className="font-medium text-ink">Düzəliş təklifləri</span> (hər məzmun səhifəsindəki &ldquo;Məlumatda
                səhv və ya əlavə var?&rdquo;): eyni şəkildə, istəyə bağlı ad və əlaqə, lazım gələrsə bir şəkil.
              </li>
              <li>
                <span className="font-medium text-ink">Elanlar</span> (/elanlar — &ldquo;Elan yerləşdir&rdquo;): ad-soyad və əlaqə
                nömrəsi/e-poçt bu formda <span className="font-medium text-ink">məcburidir</span> — elan
                təsdiqləndikdən sonra bu məlumat elanın öz səhifəsində açıq şəkildə göstərilir ki, digər sakinlər
                sizinlə əlaqə saxlaya bilsin.
              </li>
              <li>
                <span className="font-medium text-ink">Yüklənən fayllar</span> (foto/video): buludda (S3-uyğun media
                deposunda) saxlanılır və yalnız arxivə əlavə etmək məqsədilə istifadə olunur.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">Nə etmirik</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Saytda analitika və ya reklam izləmə skripti (Google Analytics və s.) yoxdur.</li>
              <li>Üçüncü tərəf reklam şəbəkələri yoxdur.</li>
              <li>Toplanan heç bir məlumat satılmır və ya kommersiya məqsədilə üçüncü tərəflərlə paylaşılmır.</li>
              <li>Adi ziyarətçilər üçün istifadəçi hesabı sistemi yoxdur — qeydiyyat tələb olunmur.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">Göndərişlər necə nəzərdən keçirilir</h2>
            <p>
              Hər göndəriş (foto, video, xatirə, tarixi məlumat, düzəliş təklifi, elan) dərc olunmadan əvvəl moderator
              tərəfindən nəzərdən keçirilir. Yalnız təsdiqlənən məzmun kənd arxivinə və ya elanlar taxtasına
              əlavə olunur.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">Admin girişi</h2>
            <p>
              Saytın idarəetmə paneli (/admin) yalnız kənd arxivini idarə edən məsul şəxslər üçündür — girişdə brauzer
              tərəfində sessiya cookie-si istifadə olunur ki, daxil olmuş admin sistemdə qalsın. Bu cookie adi
              ziyarətçilərə tətbiq olunmur və izləmə məqsədi daşımır.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">Məlumatın silinməsi</h2>
            <p>
              Göndərdiyiniz məlumatın (ad, əlaqə, foto və s.) silinməsini istəyirsinizsə, aşağıdakı e-poçt vasitəsilə
              bizimlə əlaqə saxlaya bilərsiniz — sorğunuzu araşdırıb məlumatı arxivdən çıxaracağıq.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">Əlaqə</h2>
            <p>
              Məxfilik siyasəti ilə bağlı suallarınız üçün:{" "}
              <a href="mailto:musakuce@musakuce.az" className="text-forest underline underline-offset-2 hover:text-forest-dark">
                musakuce@musakuce.az
              </a>
            </p>
          </section>

          <p className="text-sm text-ink-faint">Son yenilənmə: 2026-08-22</p>
        </div>
      </Container>
    </PageShell>
  );
}
