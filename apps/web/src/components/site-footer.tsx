import Link from 'next/link';

const COLUMNS = [
  {
    title: 'Residences',
    links: [
      { label: 'The Anchorage', href: '/listings' },
      { label: 'Lakeside Villa', href: '/listings' },
      { label: 'The Lagoon Model', href: '/listings' },
      { label: 'Beachfront Homes', href: '/listings' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Amenities', href: '/#amenities' },
      { label: 'Communities', href: '/#communities' },
      { label: 'The Life', href: '/#lifestyle' },
      { label: 'Meet the Owner', href: '/#concierge' },
    ],
  },
  {
    title: 'Concierge',
    links: [
      { label: 'Speak With Us', href: '/#lead' },
      { label: '(239) 555-0148', href: 'tel:+12395550148' },
      { label: 'By Appointment', href: '/#lead' },
      { label: 'About MVP', href: '/#concierge' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-primary-deep text-white/65">
      <div className="mx-auto max-w-[1240px] px-[clamp(22px,5vw,76px)]">
        <div className="grid gap-12 py-[78px] pb-[50px] md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr]">
          <div>
            <b className="font-serif text-2xl font-bold text-white">
              MVP <i className="text-accent not-italic">Realty</i>
            </b>
            <p className="mt-4 max-w-[36ch] font-sans text-[15.5px] leading-relaxed">
              Florida&rsquo;s Gulf-Coast concierge for luxury gated communities and beachfront
              residences, minutes from the sand.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-5 font-sans text-[13px] font-semibold tracking-[0.14em] text-white uppercase">
                {col.title}
              </h4>
              <ul className="grid gap-[13px] font-sans text-[15.5px]">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-accent transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10">
          <div className="flex flex-wrap justify-between gap-[22px] py-6 font-sans text-[13.5px]">
            <span>© 2026 MVP Realty. All rights reserved.</span>
            <span>Equal Housing Opportunity · Privacy · Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
