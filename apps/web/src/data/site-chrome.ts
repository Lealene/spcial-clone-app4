import type { FooterGlobal, HeaderGlobal } from '@mvp-realty/api-contracts';

import { heroCommunities } from './communities';

const mediaBaseUrl = 'https://pub-de584fcb52e3431f837b039818423714.r2.dev';
const link = (label: string, href: string) => ({ label, href });

export const headerFallback: HeaderGlobal = {
  brandHomeLink: link('55 Living Team home', '/'),
  brandDisplayMode: 'logo',
  brandLabel: '55 Living Team',
  brandLogo: {
    src: `${mediaBaseUrl}/55%20Living%20Logo%2007302026_2color_long.png`,
    alt: '55 Living Team',
    width: 1051,
    height: 451,
  },
  navItems: [
    { label: 'The Life', link: link('The Life', '/#lifestyle') },
    { label: 'Amenities', link: link('Amenities', '/#amenities') },
    { label: 'Communities', link: link('Communities', '/#communities') },
    { label: 'Residences', link: link('Residences', '/listings') },
  ],
  primaryCta: link('Request My Shortlist', '/#lead'),
  mobileMenuLabel: 'Menu',
  mobileMenuCloseLabel: 'Close menu',
};

export const footerFallback: FooterGlobal = {
  brandName: '55 Living Team',
  brandDisplayMode: 'logo',
  brandLogo: {
    src: `${mediaBaseUrl}/55%20Living%20Logo%2007302026_1color_long_white.png`,
    alt: '55 Living Team',
    width: 1051,
    height: 451,
  },
  brandBlurb:
    'Florida’s Gulf-Coast concierge for luxury gated communities and beachfront residences, minutes from the sand.',
  columns: [
    {
      title: 'Communities',
      links: heroCommunities.map((community) => ({
        label: community.name,
        link: link(community.name, `/communities/${community.slug}`),
      })),
    },
    {
      title: 'Explore',
      links: [
        { label: 'Amenities', link: link('Amenities', '/#amenities') },
        { label: 'Communities', link: link('Communities', '/#communities') },
        { label: 'The Life', link: link('The Life', '/#lifestyle') },
        {
          label: 'Meet the Real Estate Advisor',
          link: link('Meet the Real Estate Advisor', '/#concierge'),
        },
        { label: 'About', link: link('About', '/about') },
      ],
    },
    {
      title: 'Concierge',
      links: [
        { label: 'Speak With Us', link: link('Speak With Us', '/#lead') },
        { label: '239-777-9139', link: link('239-777-9139', 'tel:2397779139') },
        { label: 'By Appointment', link: link('By Appointment', '/#lead') },
        { label: 'About the 55 Living Team', link: link('About the 55 Living Team', '/about') },
      ],
    },
  ],
  bottomLeftText: '© 2026 55 Living Team. All rights reserved.',
  bottomRightLinks: [link('Privacy Policy', '/privacy-policy')],
};
