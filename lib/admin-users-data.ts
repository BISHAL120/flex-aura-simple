export type UserRole = "ADMIN" | "MANAGER" | "USER"

export type UserSession = {
  id: string
  expiresAt: string
  token: string
  createdAt: string
  updatedAt: string
  ipAddress?: string | null
  userAgent?: string | null
  userId: string
}

export type UserAccount = {
  id: string
  issuer?: string | null
  accountId: string
  providerId: string
  userId: string
  createdAt: string
  updatedAt: string
}

export type AdminUser = {
  id: string
  firstName: string
  lastName?: string | null
  name: string
  email: string
  emailVerified: boolean
  phoneNumber?: string | null
  profileImage?: string | null
  bio?: string | null
  location?: string | null
  isBanned: boolean
  role: UserRole[]
  createdAt: string
  updatedAt: string
  sessions: UserSession[]
  accounts: UserAccount[]
}

export const initialUsers: AdminUser[] = [
  {
    id: "usr_01hq81a9",
    firstName: "Marcus",
    lastName: "Vance",
    name: "Marcus Vance",
    email: "marcus.vance@flexaura.com",
    emailVerified: true,
    phoneNumber: "+1 (415) 890-2144",
    profileImage: "/products/product1.webp",
    bio: "Head of Workshop & Lead Laser Sculptor at Flex Aura Studio.",
    location: "San Francisco, CA, USA",
    isBanned: false,
    role: ["ADMIN", "MANAGER"],
    createdAt: "2025-11-10T08:30:00.000Z",
    updatedAt: "2026-08-20T14:15:00.000Z",
    sessions: [
      {
        id: "sess_01",
        token: "tok_mv_mac_chrome_01",
        ipAddress: "192.168.1.105",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
        createdAt: "2026-09-02T18:20:00.000Z",
        expiresAt: "2026-10-02T18:20:00.000Z",
        updatedAt: "2026-09-02T18:20:00.000Z",
        userId: "usr_01hq81a9",
      },
      {
        id: "sess_02",
        token: "tok_mv_ios_safari_02",
        ipAddress: "73.222.44.18",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
        createdAt: "2026-09-01T09:12:00.000Z",
        expiresAt: "2026-10-01T09:12:00.000Z",
        updatedAt: "2026-09-01T09:12:00.000Z",
        userId: "usr_01hq81a9",
      },
    ],
    accounts: [
      {
        id: "acc_mv_01",
        providerId: "credential",
        accountId: "marcus.vance@flexaura.com",
        issuer: null,
        userId: "usr_01hq81a9",
        createdAt: "2025-11-10T08:30:00.000Z",
        updatedAt: "2025-11-10T08:30:00.000Z",
      },
      {
        id: "acc_mv_02",
        providerId: "google",
        accountId: "109827364512398746",
        issuer: "accounts.google.com",
        userId: "usr_01hq81a9",
        createdAt: "2025-12-01T11:00:00.000Z",
        updatedAt: "2025-12-01T11:00:00.000Z",
      },
    ],
  },
  {
    id: "usr_02hq82b1",
    firstName: "Elena",
    lastName: "Rostova",
    name: "Elena Rostova",
    email: "elena.cad@flexaura.com",
    emailVerified: true,
    phoneNumber: "+44 20 7946 0912",
    profileImage: null,
    bio: "Automotive CAD vector specialist & CNC program coordinator.",
    location: "London, UK",
    isBanned: false,
    role: ["MANAGER"],
    createdAt: "2025-12-05T10:00:00.000Z",
    updatedAt: "2026-08-25T11:45:00.000Z",
    sessions: [
      {
        id: "sess_03",
        token: "tok_er_win_edge_01",
        ipAddress: "86.14.198.54",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0",
        createdAt: "2026-09-02T14:30:00.000Z",
        expiresAt: "2026-10-02T14:30:00.000Z",
        updatedAt: "2026-09-02T14:30:00.000Z",
        userId: "usr_02hq82b1",
      },
    ],
    accounts: [
      {
        id: "acc_er_01",
        providerId: "google",
        accountId: "10492837461928374",
        issuer: "accounts.google.com",
        userId: "usr_02hq82b1",
        createdAt: "2025-12-05T10:00:00.000Z",
        updatedAt: "2025-12-05T10:00:00.000Z",
      },
    ],
  },
  {
    id: "usr_03hq83c2",
    firstName: "Julian",
    lastName: "Weber",
    name: "Julian Weber",
    email: "julian.weber@auto-collector.de",
    emailVerified: true,
    phoneNumber: "+49 89 1234567",
    profileImage: null,
    bio: "Porsche & vintage air-cooled enthusiast. Commissioned bespoke 964 RWB wall art.",
    location: "Munich, Germany",
    isBanned: false,
    role: ["USER"],
    createdAt: "2026-01-15T15:20:00.000Z",
    updatedAt: "2026-08-29T10:05:00.000Z",
    sessions: [
      {
        id: "sess_04",
        token: "tok_jw_mac_firefox_01",
        ipAddress: "91.64.120.89",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.3; rv:124.0) Gecko/20100101 Firefox/124.0",
        createdAt: "2026-08-28T19:40:00.000Z",
        expiresAt: "2026-09-28T19:40:00.000Z",
        updatedAt: "2026-08-28T19:40:00.000Z",
        userId: "usr_03hq83c2",
      },
    ],
    accounts: [
      {
        id: "acc_jw_01",
        providerId: "credential",
        accountId: "julian.weber@auto-collector.de",
        issuer: null,
        userId: "usr_03hq83c2",
        createdAt: "2026-01-15T15:20:00.000Z",
        updatedAt: "2026-01-15T15:20:00.000Z",
      },
    ],
  },
  {
    id: "usr_04hq84d3",
    firstName: "Sophie",
    lastName: "Laurent",
    name: "Sophie Laurent",
    email: "sophie.laurent@interiors-paris.fr",
    emailVerified: true,
    phoneNumber: "+33 1 42 68 55 00",
    profileImage: null,
    bio: "Interior architect sourcing backlit ambient metal panels for luxury garage projects.",
    location: "Paris, France",
    isBanned: false,
    role: ["USER"],
    createdAt: "2026-02-04T12:00:00.000Z",
    updatedAt: "2026-08-14T16:30:00.000Z",
    sessions: [
      {
        id: "sess_05",
        token: "tok_sl_ipad_safari_01",
        ipAddress: "195.154.122.9",
        userAgent: "Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
        createdAt: "2026-08-30T10:15:00.000Z",
        expiresAt: "2026-09-30T10:15:00.000Z",
        updatedAt: "2026-08-30T10:15:00.000Z",
        userId: "usr_04hq84d3",
      },
    ],
    accounts: [
      {
        id: "acc_sl_01",
        providerId: "google",
        accountId: "11928374659283746",
        issuer: "accounts.google.com",
        userId: "usr_04hq84d3",
        createdAt: "2026-02-04T12:00:00.000Z",
        updatedAt: "2026-02-04T12:00:00.000Z",
      },
    ],
  },
  {
    id: "usr_05hq85e4",
    firstName: "Tariq",
    lastName: "Al-Mansoor",
    name: "Tariq Al-Mansoor",
    email: "tariq.mansoor@motorsport-uae.com",
    emailVerified: true,
    phoneNumber: "+971 4 390 1111",
    profileImage: null,
    bio: "Track day driver and supercar collector. Ordered 6 backlit motorsport silhouettes.",
    location: "Dubai, United Arab Emirates",
    isBanned: false,
    role: ["USER"],
    createdAt: "2026-03-11T09:45:00.000Z",
    updatedAt: "2026-09-01T17:22:00.000Z",
    sessions: [
      {
        id: "sess_06",
        token: "tok_ta_mac_chrome_01",
        ipAddress: "94.200.18.72",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
        createdAt: "2026-09-01T17:20:00.000Z",
        expiresAt: "2026-10-01T17:20:00.000Z",
        updatedAt: "2026-09-01T17:20:00.000Z",
        userId: "usr_05hq85e4",
      },
    ],
    accounts: [
      {
        id: "acc_ta_01",
        providerId: "credential",
        accountId: "tariq.mansoor@motorsport-uae.com",
        issuer: null,
        userId: "usr_05hq85e4",
        createdAt: "2026-03-11T09:45:00.000Z",
        updatedAt: "2026-03-11T09:45:00.000Z",
      },
    ],
  },
  {
    id: "usr_06hq86f5",
    firstName: "Alex",
    lastName: "Rider",
    name: "Alex Rider",
    email: "alex.rider.spammer@tempmail.xyz",
    emailVerified: false,
    phoneNumber: "+1 (555) 019-2834",
    profileImage: null,
    bio: "Account flagged for automated inquiry submission abuse and suspicious card trials.",
    location: "Chicago, IL, USA",
    isBanned: true,
    role: ["USER"],
    createdAt: "2026-06-18T22:10:00.000Z",
    updatedAt: "2026-07-02T15:00:00.000Z",
    sessions: [],
    accounts: [
      {
        id: "acc_ar_01",
        providerId: "credential",
        accountId: "alex.rider.spammer@tempmail.xyz",
        issuer: null,
        userId: "usr_06hq86f5",
        createdAt: "2026-06-18T22:10:00.000Z",
        updatedAt: "2026-06-18T22:10:00.000Z",
      },
    ],
  },
  {
    id: "usr_07hq87g6",
    firstName: "Kenji",
    lastName: "Takahashi",
    name: "Kenji Takahashi",
    email: "kenji.gtr@tokyo-speed.jp",
    emailVerified: true,
    phoneNumber: "+81 3 5555 0142",
    profileImage: null,
    bio: "JDM specialist & Skyline GT-R R34 club organizer.",
    location: "Tokyo, Japan",
    isBanned: false,
    role: ["USER"],
    createdAt: "2026-04-02T07:15:00.000Z",
    updatedAt: "2026-08-19T13:40:00.000Z",
    sessions: [
      {
        id: "sess_07",
        token: "tok_kt_win_chrome_01",
        ipAddress: "133.242.180.12",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
        createdAt: "2026-08-19T13:35:00.000Z",
        expiresAt: "2026-09-19T13:35:00.000Z",
        updatedAt: "2026-08-19T13:35:00.000Z",
        userId: "usr_07hq87g6",
      },
    ],
    accounts: [
      {
        id: "acc_kt_01",
        providerId: "google",
        accountId: "10293847561029384",
        issuer: "accounts.google.com",
        userId: "usr_07hq87g6",
        createdAt: "2026-04-02T07:15:00.000Z",
        updatedAt: "2026-04-02T07:15:00.000Z",
      },
    ],
  },
  {
    id: "usr_08hq88h7",
    firstName: "Liam",
    lastName: "O'Connor",
    name: "Liam O'Connor",
    email: "liam.oc@dublin-cycles.ie",
    emailVerified: true,
    phoneNumber: "+353 1 496 0000",
    profileImage: null,
    bio: "Custom motorcycle builder. Commissioned 3 cafe racer metal art backdrops.",
    location: "Dublin, Ireland",
    isBanned: false,
    role: ["USER"],
    createdAt: "2026-05-14T11:30:00.000Z",
    updatedAt: "2026-08-10T09:15:00.000Z",
    sessions: [
      {
        id: "sess_08",
        token: "tok_lo_ios_safari_01",
        ipAddress: "89.100.24.11",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
        createdAt: "2026-08-10T09:10:00.000Z",
        expiresAt: "2026-09-10T09:10:00.000Z",
        updatedAt: "2026-08-10T09:10:00.000Z",
        userId: "usr_08hq88h7",
      },
    ],
    accounts: [
      {
        id: "acc_lo_01",
        providerId: "credential",
        accountId: "liam.oc@dublin-cycles.ie",
        issuer: null,
        userId: "usr_08hq88h7",
        createdAt: "2026-05-14T11:30:00.000Z",
        updatedAt: "2026-05-14T11:30:00.000Z",
      },
    ],
  },
  {
    id: "usr_09hq89i8",
    firstName: "Chloe",
    lastName: "Dupont",
    name: "Chloe Dupont",
    email: "chloe.dupont.fake@disposable.net",
    emailVerified: false,
    phoneNumber: "+1 (555) 349-9912",
    profileImage: null,
    bio: "Banned for repeated fraudulent chargebacks and stolen card attempts.",
    location: "Miami, FL, USA",
    isBanned: true,
    role: ["USER"],
    createdAt: "2026-07-01T04:20:00.000Z",
    updatedAt: "2026-07-03T18:40:00.000Z",
    sessions: [],
    accounts: [
      {
        id: "acc_cd_01",
        providerId: "credential",
        accountId: "chloe.dupont.fake@disposable.net",
        issuer: null,
        userId: "usr_09hq89i8",
        createdAt: "2026-07-01T04:20:00.000Z",
        updatedAt: "2026-07-01T04:20:00.000Z",
      },
    ],
  },
  {
    id: "usr_10hq90j9",
    firstName: "Mateo",
    lastName: "Silva",
    name: "Mateo Silva",
    email: "mateo.silva@curva-racing.br",
    emailVerified: true,
    phoneNumber: "+55 11 98765-4321",
    profileImage: null,
    bio: "Motorsport sim racing team manager. Ordering Ayrton Senna MP4/4 wall pieces.",
    location: "São Paulo, Brazil",
    isBanned: false,
    role: ["USER"],
    createdAt: "2026-06-08T16:50:00.000Z",
    updatedAt: "2026-08-31T20:10:00.000Z",
    sessions: [
      {
        id: "sess_09",
        token: "tok_ms_android_chrome_01",
        ipAddress: "177.18.230.45",
        userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36",
        createdAt: "2026-08-31T20:05:00.000Z",
        expiresAt: "2026-09-30T20:05:00.000Z",
        updatedAt: "2026-08-31T20:05:00.000Z",
        userId: "usr_10hq90j9",
      },
    ],
    accounts: [
      {
        id: "acc_ms_01",
        providerId: "google",
        accountId: "11029384756473829",
        issuer: "accounts.google.com",
        userId: "usr_10hq90j9",
        createdAt: "2026-06-08T16:50:00.000Z",
        updatedAt: "2026-06-08T16:50:00.000Z",
      },
    ],
  },
  {
    id: "usr_11hq91k0",
    firstName: "Sarah",
    lastName: "Jenkins",
    name: "Sarah Jenkins",
    email: "sarah.j.ops@flexaura.com",
    emailVerified: true,
    phoneNumber: "+1 (206) 555-0199",
    profileImage: null,
    bio: "Customer experience supervisor & order fulfillment manager.",
    location: "Seattle, WA, USA",
    isBanned: false,
    role: ["MANAGER"],
    createdAt: "2026-01-20T09:00:00.000Z",
    updatedAt: "2026-08-15T10:00:00.000Z",
    sessions: [
      {
        id: "sess_10",
        token: "tok_sj_mac_safari_01",
        ipAddress: "67.183.190.22",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 Version/17.4 Safari/605.1.15",
        createdAt: "2026-09-02T11:00:00.000Z",
        expiresAt: "2026-10-02T11:00:00.000Z",
        updatedAt: "2026-09-02T11:00:00.000Z",
        userId: "usr_11hq91k0",
      },
    ],
    accounts: [
      {
        id: "acc_sj_01",
        providerId: "credential",
        accountId: "sarah.j.ops@flexaura.com",
        issuer: null,
        userId: "usr_11hq91k0",
        createdAt: "2026-01-20T09:00:00.000Z",
        updatedAt: "2026-01-20T09:00:00.000Z",
      },
    ],
  },
  {
    id: "usr_12hq92l1",
    firstName: "David",
    lastName: "Kim",
    name: "David Kim",
    email: "david.kim@seoul-drifters.kr",
    emailVerified: true,
    phoneNumber: "+82 2 3456 7890",
    profileImage: null,
    bio: "Automotive content creator. Showcase pieces for studio backdrops.",
    location: "Seoul, South Korea",
    isBanned: false,
    role: ["USER"],
    createdAt: "2026-07-12T05:30:00.000Z",
    updatedAt: "2026-08-22T14:10:00.000Z",
    sessions: [
      {
        id: "sess_11",
        token: "tok_dk_win_chrome_01",
        ipAddress: "121.134.89.210",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
        createdAt: "2026-08-22T14:05:00.000Z",
        expiresAt: "2026-09-22T14:05:00.000Z",
        updatedAt: "2026-08-22T14:05:00.000Z",
        userId: "usr_12hq92l1",
      },
    ],
    accounts: [
      {
        id: "acc_dk_01",
        providerId: "google",
        accountId: "10928374615243546",
        issuer: "accounts.google.com",
        userId: "usr_12hq92l1",
        createdAt: "2026-07-12T05:30:00.000Z",
        updatedAt: "2026-07-12T05:30:00.000Z",
      },
    ],
  },
]
