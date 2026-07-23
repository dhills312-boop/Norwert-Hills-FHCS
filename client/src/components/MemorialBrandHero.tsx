type MemorialBrandHeroProps = {
  firstName: string;
  lastName: string;
  portraitSrc: string;
  dateOfBirth?: string;
  dateOfPassing?: string;
  epitaph?: string;
};

const logoImage = "/assets/logo-crest.png";

export default function MemorialBrandHero({
  firstName,
  lastName,
  portraitSrc,
  dateOfBirth,
  dateOfPassing,
  epitaph,
}: MemorialBrandHeroProps) {
  const lifeDates = [dateOfBirth, dateOfPassing].filter(Boolean).join(" - ");

  return (
    <section className="memorial-hero" data-testid="section-hero">
      <div className="memorial-brand-seal" aria-label="Norwert Hills Funeral and Cremation Services">
        <span className="memorial-brand-line" aria-hidden="true" />
        <span className="memorial-brand-mark">
          <img src={logoImage} alt="" />
        </span>
        <span className="memorial-brand-line memorial-brand-line-right" aria-hidden="true" />
      </div>

      <div className="memorial-hero-layout">
        <div className="memorial-portrait-frame">
          <div className="memorial-portrait-halo" aria-hidden="true" />
          <div className="memorial-portrait">
            <img src={portraitSrc} alt={`${firstName} ${lastName}`} />
          </div>
        </div>

        <div className="memorial-hero-copy">
          <p className="memorial-eyebrow">In Loving Memory</p>
          <h1 className="memorial-name" data-testid="text-deceased-name">
            {firstName} {lastName}
          </h1>
          {lifeDates && <p className="memorial-life-dates">{lifeDates}</p>}
          {epitaph && <p className="memorial-epitaph">"{epitaph}"</p>}
        </div>
      </div>

      <p className="memorial-brand-name">Norwert Hills Funeral &amp; Cremation Services</p>
    </section>
  );
}
