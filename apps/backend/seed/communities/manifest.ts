export const communitySeedAssets = {
  bbPool: {
    fileName: 'bb-pool.jpg',
    alt: "Aerial of Bonita Bay's resort pool and clubhouse",
    mimeType: 'image/jpeg',
    sha256: '168405d16dbe81e22b645680fd0ada8de3963fa206d92b58208c6cadbcc8380a',
  },
  bbLanai: {
    fileName: 'bb-lanai.jpg',
    alt: 'Screened lanai and private pool overlooking the preserve',
    mimeType: 'image/jpeg',
    sha256: '3665c32d67fd790f97a6cce739c220e2c8a1e1abf0e0bbef0b9ddba7b3510d5e',
  },
  sharedKitchen: {
    fileName: 'shared-kitchen.jpg',
    alt: 'Bright white kitchen with island and stone counters',
    mimeType: 'image/jpeg',
    sha256: '6a6181f8e2a1a03f8225612c278102f71489e0569a63ebe708dd329d902708b3',
  },
  bbMarina: {
    fileName: 'bb-marina.jpg',
    alt: 'Aerial over the community marina and tennis courts',
    mimeType: 'image/jpeg',
    sha256: 'da62234efb45c4c6ff17d22e83732d96decc8fae6b6ad4f30e4f74fc773c2450',
  },
  vbVilla: {
    fileName: 'vb-villa.jpg',
    alt: 'A single-story villa with a tile roof and paver drive at Valencia Bonita',
    mimeType: 'image/jpeg',
    sha256: '20e75197485e4c285cfdb09a477955f796b1a4fc667c623b660504429c85aea6',
  },
  vbCourtyard: {
    fileName: 'vb-courtyard.jpg',
    alt: 'A landscaped courtyard entry framed by tropical plantings',
    mimeType: 'image/jpeg',
    sha256: '2c3ece3934dacccbca6892dc538d3b35a0f17ffe404e024fde95dad8558ffa3a',
  },
  vbKitchen: {
    fileName: 'shared-kitchen.jpg',
    alt: 'A bright open kitchen with quartz island and shaker cabinets',
    mimeType: 'image/jpeg',
    sha256: '6a6181f8e2a1a03f8225612c278102f71489e0569a63ebe708dd329d902708b3',
  },
  vbPool: {
    fileName: 'vb-pool.jpg',
    alt: 'Resort pool deck with cabanas and lounge chairs',
    mimeType: 'image/jpeg',
    sha256: 'ad2e9041a303411f01e99fae3035ef865e52e43aad8e159d0b94276707d1d027',
  },
  vtHome: {
    fileName: 'vt-home.jpg',
    alt: 'A new single-family home with a tile roof and palm-lined drive',
    mimeType: 'image/jpeg',
    sha256: 'fc468fbb1c172d8fd2eacc68ef8d520d8c13028affa66485e78e0fa05278d0a1',
  },
  vtGreatroom: {
    fileName: 'vt-greatroom.jpg',
    alt: 'A decorated model great room with high ceilings and wood floors',
    mimeType: 'image/jpeg',
    sha256: 'ca58dcf9ff25856625560b97974b83b78a4f2f719f796a24183a70cda004c2de',
  },
  vtPool: {
    fileName: 'vt-pool.jpg',
    alt: 'Resort pool and cabanas beside the clubhouse',
    mimeType: 'image/jpeg',
    sha256: 'a846e0db881f2b2a35bd888fd09f68a88d7fb09eb39cd4fbea4608dd74ebbd25',
  },
  vtTrail: {
    fileName: 'vt-trail.jpg',
    alt: 'A landscaped walking trail winding past lakes',
    mimeType: 'image/jpeg',
    sha256: 'a0ab5c4a8208a2b2f92d8d5626f0503b57bddd638f68baf037669a0233683cb8',
  },
} as const;

export type CommunitySeedAssetKey = keyof typeof communitySeedAssets;
