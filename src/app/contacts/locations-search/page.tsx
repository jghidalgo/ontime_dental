'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const navigationItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Patients', href: '/patients' },
  { label: 'Laboratory', href: '/laboratory' },
  { label: 'Documents', href: '/documents' },
  { label: 'Contacts', href: '/contacts' },
  { label: 'Schedules', href: '/schedules' },
  { label: 'Insurances', href: '/insurances' },
  { label: 'Complaints', href: '/complaints' },
  { label: 'Licenses', href: '/licenses' },
  { label: 'Medication', href: '/medication' },
  { label: 'HR', href: '/hr' },
  { label: 'Tickets', href: '/tickets' }
];

type Coordinates = {
  lat: number;
  lng: number;
};

type ClinicLocation = {
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
  hours: string;
  coordinates: Coordinates;
};

type CompanyLocations = {
  companyId: string;
  companyName: string;
  headquarters: string;
  description: string;
  mapCenter: Coordinates;
  clinics: ClinicLocation[];
};

const companyLocations: CompanyLocations[] = [
  {
    companyId: 'ontime-holdings',
    companyName: 'OnTime Dental Holdings',
    headquarters: 'San Juan, PR',
    description: 'Puerto Rico network of clinics delivering community-first dental care with bilingual teams and extended hours.',
    mapCenter: { lat: 18.438555, lng: -66.062911 },
    clinics: [
      {
        id: 'PR-SJ-01',
        name: 'Old San Juan Clinic',
        address: '101 Fortaleza Street Suite 210',
        city: 'San Juan, PR',
        zip: '00901',
        phone: '(787) 555-5200',
        email: 'oldsanjuan@ontimedental.com',
        hours: 'Mon–Fri 8:00a – 6:00p',
        coordinates: { lat: 18.465539, lng: -66.105735 }
      },
      {
        id: 'PR-CG-02',
        name: 'Caguas Specialty Center',
        address: '500 Calle Betances Level 3',
        city: 'Caguas, PR',
        zip: '00725',
        phone: '(787) 555-6200',
        email: 'caguas@ontimedental.com',
        hours: 'Mon–Sat 8:00a – 7:00p',
        coordinates: { lat: 18.233412, lng: -66.039993 }
      },
      {
        id: 'PR-BY-03',
        name: 'Bayamón Family Dental',
        address: '77 Avenida Main Plaza',
        city: 'Bayamón, PR',
        zip: '00956',
        phone: '(787) 555-6210',
        email: 'bayamon@ontimedental.com',
        hours: 'Mon–Fri 9:00a – 5:30p',
        coordinates: { lat: 18.39856, lng: -66.155723 }
      }
    ]
  },
  {
    companyId: 'bluno-james',
    companyName: 'Bluno James Dental Group',
    headquarters: 'Miami, FL',
    description: 'South Florida flagship centers focused on cosmetic and specialty dentistry with concierge teams.',
    mapCenter: { lat: 25.761681, lng: -80.191788 },
    clinics: [
      {
        id: 'FL-MIA-01',
        name: 'Coral Gables Flagship',
        address: '120 Miracle Mile Suite 500',
        city: 'Coral Gables, FL',
        zip: '33134',
        phone: '(305) 555-1100',
        email: 'coralgables@blunojames.com',
        hours: 'Mon–Sat 8:00a – 6:00p',
        coordinates: { lat: 25.750145, lng: -80.263724 }
      },
      {
        id: 'FL-MIA-02',
        name: 'Miller Dental Studio',
        address: '8455 SW 72nd Street Suite 210',
        city: 'Miami, FL',
        zip: '33143',
        phone: '(305) 555-3012',
        email: 'miller@blunojames.com',
        hours: 'Mon–Fri 8:00a – 5:00p',
        coordinates: { lat: 25.701531, lng: -80.323273 }
      },
      {
        id: 'FL-MIA-03',
        name: 'Biscayne Pediatric Loft',
        address: '3101 NE 7th Avenue Level 9',
        city: 'Miami, FL',
        zip: '33137',
        phone: '(305) 555-3077',
        email: 'biscayne@blunojames.com',
        hours: 'Mon–Sat 9:00a – 5:00p',
        coordinates: { lat: 25.806173, lng: -80.185837 }
      }
    ]
  }
];

const domainToCompany: Record<string, string> = {
  'ontimedental.com': 'ontime-holdings',
  'blunojames.com': 'bluno-james'
};

type TokenPayload = {
  email?: string;
};

function decodeToken(token: string): TokenPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload) as TokenPayload;
  } catch (error) {
    console.error('Unable to decode auth token', error);
    return null;
  }
}

function formatDisplayName(email: string) {
  const [localPart] = email.split('@');
  if (!localPart) {
    return 'Team Member';
  }

  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export default function LocationSearchPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [companyId, setCompanyId] = useState(companyLocations[0]?.companyId ?? '');
  const [searchQuery, setSearchQuery] = useState('');
  const [zipQuery, setZipQuery] = useState('');
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(
    companyLocations[0]?.clinics[0]?.id ?? null
  );
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  useEffect(() => {
    const token = window.localStorage.getItem('ontime.authToken');

    if (!token) {
      router.push('/login');
      return;
    }

    const payload = decodeToken(token);

    if (payload?.email) {
      setUserEmail(payload.email);
      setDisplayName(formatDisplayName(payload.email));
      const domain = payload.email.split('@')[1]?.toLowerCase();
      if (domain && domainToCompany[domain]) {
        setCompanyId(domainToCompany[domain]);
      }
    } else {
      setDisplayName('Team Member');
    }
  }, [router]);

  const currentCompany = useMemo(() => {
    return companyLocations.find((company) => company.companyId === companyId) ?? companyLocations[0];
  }, [companyId]);

  useEffect(() => {
    if (!currentCompany) {
      return;
    }

    setSelectedClinicId((prev) => {
      if (prev && currentCompany.clinics.some((clinic) => clinic.id === prev)) {
        return prev;
      }
      return currentCompany.clinics[0]?.id ?? null;
    });
  }, [currentCompany]);

  const filteredClinics = useMemo(() => {
    const nameQuery = searchQuery.trim().toLowerCase();
    const zipOrAddressQuery = zipQuery.trim().toLowerCase();

    return currentCompany.clinics.filter((clinic) => {
      const matchesName = nameQuery
        ? clinic.name.toLowerCase().includes(nameQuery) || clinic.city.toLowerCase().includes(nameQuery)
        : true;

      const matchesZip = zipOrAddressQuery
        ? clinic.zip.includes(zipOrAddressQuery) ||
          clinic.address.toLowerCase().includes(zipOrAddressQuery) ||
          clinic.city.toLowerCase().includes(zipOrAddressQuery)
        : true;

      return matchesName && matchesZip;
    });
  }, [currentCompany, searchQuery, zipQuery]);

  useEffect(() => {
    if (!filteredClinics.length) {
      setSelectedClinicId(null);
      return;
    }

    setSelectedClinicId((prev) => {
      if (prev && filteredClinics.some((clinic) => clinic.id === prev)) {
        return prev;
      }

      return filteredClinics[0]?.id ?? null;
    });
  }, [filteredClinics]);

  const selectedClinic = filteredClinics.find((clinic) => clinic.id === selectedClinicId) ?? null;

  const mapSource = selectedClinic
    ? `https://maps.google.com/maps?q=${selectedClinic.coordinates.lat},${selectedClinic.coordinates.lng}&t=${
        mapType === 'satellite' ? 'k' : ''
      }&z=13&output=embed`
    : `https://maps.google.com/maps?q=${currentCompany.mapCenter.lat},${currentCompany.mapCenter.lng}&t=${
        mapType === 'satellite' ? 'k' : ''
      }&z=10&output=embed`;

  const handleLogout = () => {
    window.localStorage.removeItem('ontime.authToken');
    router.push('/login');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary-500/10 via-slate-950 to-slate-950" />
      <div className="absolute -top-40 left-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary-500/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[120rem]">
        <aside className="hidden w-72 flex-col border-r border-white/5 bg-white/[0.02] px-6 py-10 backdrop-blur-2xl lg:flex">
          <div>
            <div className="flex items-center gap-3 text-slate-100">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-500/15 text-sm font-semibold uppercase tracking-[0.35em] text-primary-100 ring-1 ring-primary-400/30">
                OD
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.45em] text-primary-200/70">OnTime</p>
                <p className="text-base font-semibold text-slate-50">Dental OS</p>
              </div>
            </div>

            <nav className="mt-12 space-y-1">
              {navigationItems.map((item) => {
                const isActive = item.href === '/contacts';

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'border-primary-400/60 bg-primary-500/15 text-white shadow-lg shadow-primary-900/30'
                        : 'border-white/5 text-slate-300 hover:border-primary-400/40 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={`text-xs font-semibold uppercase tracking-[0.3em] ${
                        isActive ? 'text-primary-200' : 'text-slate-500'
                      }`}
                    >
                      {isActive ? '•' : '→'}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-300 shadow-2xl shadow-slate-950/40">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-primary-200/70">Field tip</p>
            <p className="mt-3 text-base font-semibold text-slate-50">Confirm GPS pins</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Update each clinic&apos;s coordinates whenever a new operatory opens. Accurate pins keep dispatch and patient text alerts on track.
            </p>
            <button className="mt-4 w-full rounded-2xl border border-primary-400/30 bg-primary-500/20 px-4 py-2 text-sm font-semibold text-primary-50 transition hover:bg-primary-400/30">
              Share update
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="flex flex-col gap-8 border-b border-white/5 bg-white/[0.02] px-6 pb-10 pt-10 backdrop-blur-2xl lg:px-12">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.35em] text-primary-200/70">Locations search</p>
                <h1 className="text-3xl font-semibold text-slate-50">Locate clinics across {currentCompany.companyName}</h1>
                <p className="max-w-2xl text-sm text-slate-400">
                  {currentCompany.description}
                </p>
              </div>

              <div className="flex items-center gap-3 self-end lg:self-auto">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                  Signed in as{' '}
                  <span className="font-semibold text-slate-100">{displayName || 'Team Member'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-2xl bg-primary-500/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-primary-900/40 transition hover:bg-primary-400"
                >
                  Logout
                </button>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-3 border-t border-white/5 pt-6 text-sm text-slate-300">
              <Link
                href="/contacts"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-semibold transition hover:border-primary-400/40 hover:text-white"
              >
                ← Back to contacts
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-400/40 bg-primary-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-100">
                {currentCompany.companyName}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                HQ · {currentCompany.headquarters}
              </span>
              {userEmail && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  {userEmail}
                </span>
              )}
            </nav>
          </header>

          <main className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:px-10">
            <section className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                <form className="flex flex-col gap-4 lg:flex-row lg:items-end">
                  <div className="flex-1">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                      Location name search
                    </label>
                    <input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search clinics or cities"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/60 focus:outline-none"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                      Enter address or zip code
                    </label>
                    <input
                      value={zipQuery}
                      onChange={(event) => setZipQuery(event.target.value)}
                      placeholder="Filter by street, city, or ZIP"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/60 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMapType('roadmap')}
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                        mapType === 'roadmap'
                          ? 'bg-primary-500/90 text-slate-900 shadow-lg shadow-primary-900/40'
                          : 'border border-white/10 bg-white/5 text-slate-300 hover:border-primary-400/40 hover:text-white'
                      }`}
                    >
                      Map
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapType('satellite')}
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                        mapType === 'satellite'
                          ? 'bg-primary-500/90 text-slate-900 shadow-lg shadow-primary-900/40'
                          : 'border border-white/10 bg-white/5 text-slate-300 hover:border-primary-400/40 hover:text-white'
                      }`}
                    >
                      Satellite
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setZipQuery('');
                    }}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-primary-400/40 hover:text-white"
                  >
                    Clear
                  </button>
                </form>
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 shadow-2xl shadow-slate-950/40">
                <div className="flex flex-col gap-3 border-b border-white/5 px-6 py-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">Interactive map</p>
                    <h2 className="text-2xl font-semibold text-slate-50">
                      {selectedClinic ? selectedClinic.name : 'All clinics'}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {filteredClinics.length} locations matched your filters.
                    </p>
                  </div>
                  {selectedClinic && (
                    <div className="rounded-2xl border border-primary-400/30 bg-primary-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-100">
                      {selectedClinic.city} · {selectedClinic.zip}
                    </div>
                  )}
                </div>

                <div className="h-[28rem] w-full bg-slate-900/80">
                  <iframe
                    key={`${selectedClinic?.id ?? 'default'}-${mapType}`}
                    src={mapSource}
                    className="h-full w-full"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>

                {selectedClinic ? (
                  <div className="grid gap-6 border-t border-white/5 bg-white/[0.02] px-6 py-6 md:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">Address</p>
                      <p className="mt-2 text-sm text-slate-100">
                        {selectedClinic.address}
                        <br />
                        {selectedClinic.city} {selectedClinic.zip}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">Contact</p>
                      <p className="mt-2 text-sm text-slate-100">{selectedClinic.phone}</p>
                      <p className="text-sm text-primary-200">{selectedClinic.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">Hours</p>
                      <p className="mt-2 text-sm text-slate-100">{selectedClinic.hours}</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-white/5 bg-white/[0.02] px-6 py-6 text-sm text-slate-400">
                    No locations matched your filters. Adjust the search terms to explore more clinics.
                  </div>
                )}
              </div>
            </section>

            <aside className="h-full space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">Clinic directory</p>
                    <h3 className="text-xl font-semibold text-slate-50">{filteredClinics.length} results</h3>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200 transition hover:text-primary-100"
                    onClick={() => window.print()}
                  >
                    Export
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {filteredClinics.length ? (
                    filteredClinics.map((clinic) => {
                      const isActive = clinic.id === selectedClinicId;
                      return (
                        <button
                          key={clinic.id}
                          type="button"
                          onClick={() => setSelectedClinicId(clinic.id)}
                          className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                            isActive
                              ? 'border-primary-400/60 bg-primary-500/15 text-white shadow-lg shadow-primary-900/30'
                              : 'border-white/10 bg-white/5 text-slate-200 hover:border-primary-400/40 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-inherit">{clinic.name}</p>
                            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-100">
                              {clinic.zip}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-300">
                            {clinic.address}, {clinic.city}
                          </p>
                          <p className="mt-2 text-sm text-slate-200">{clinic.phone}</p>
                        </button>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-400">
                      No clinics available for the current filters.
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </main>
        </div>
      </div>
    </div>
  );
}
