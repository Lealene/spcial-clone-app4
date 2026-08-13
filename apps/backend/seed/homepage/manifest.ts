export const homepageSeedAssets = {
  hero: {
    fileName: 'hero-naples-waterfront.jpg',
    alt: 'Naples bayfront residences along the Gulf Coast at golden hour',
    mimeType: 'image/jpeg',
    sha256: '9a64ed39f1e62410517d24a2360160e5752a1e9bbc8df180944c907506781aef',
  },
  owner: {
    fileName: 'owner-eleanor-voss.jpg',
    alt: 'Portrait of Eleanor Voss, Broker and Owner of 55 Living Team, with her Doberman',
    mimeType: 'image/jpeg',
    sha256: '74af39f942c701b885e51084ff003d7d957fa32bc87b348a85b4a1d686289748',
  },
  bonitaBay: {
    fileName: 'community-bonita-bay.jpg',
    alt: "Bonita Bay's landmark stone entrance monument framed by oaks and flowering beds",
    mimeType: 'image/jpeg',
    sha256: '978435a6e30066331a8617861f71cddf6b1c94a246cd4b2799841bb7d9c6741f',
  },
  valenciaBonita: {
    fileName: 'community-valencia-bonita.jpg',
    alt: 'The 45,000-square-foot resort clubhouse at Valencia Bonita, framed by royal palms',
    mimeType: 'image/jpeg',
    sha256: '3eb3d823fa065479ee9ff5885b3bdd260c0fba91daee387f6c2ab0088c478767',
  },
  valenciaTrails: {
    fileName: 'community-valencia-trails.jpg',
    alt: 'Aerial of the resort-style beach-entry pool and clubhouse at Valencia Trails',
    mimeType: 'image/jpeg',
    sha256: '3a96abcb0c6b9912b0de34726477e62be61fe67293ceb8b47270ee5184d98434',
  },
} as const;

export type HomepageSeedAssetKey = keyof typeof homepageSeedAssets;
