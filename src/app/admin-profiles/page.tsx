import countryData from "@/lib/countries.json";

import { toLandingAssetUrl, getOptimizedMediaUrl } from "@/lib/landing-assets";
import LoadedImage from "@/components/ui/LoadedImage";

export const dynamic = "force-dynamic";

interface Profile {
  id: string;
  name: string;
  handle: string;
  country: string;
  flagCode: string;
  countries: number;
  media: number;
  collections: number;
  images: {
    cover: string;
    avatar: string;
    gallery: string[];
  };
}

function toFlagAssetPath(flagCode: string) {
  return `/flags/${flagCode.toUpperCase()}.svg`;
}

function resolveImageAsset(img: any) {
  return typeof img === "string" ? img : img?.url ?? "";
}

// Build reverse map for country names
const nameToCode: Record<string, string> = {};
for (const [code, name] of Object.entries(countryData)) {
  nameToCode[(name as string).toLowerCase()] = code;
}

function normalizeProfile(p: any): Profile {
  const images = p.images || { cover: "", avatar: "", gallery: [] };

  let flagCode = (p.flag_code || p.flagCode || "").toLowerCase();
  let country = p.country || "";

  if (flagCode && !country) {
    country = (countryData as Record<string, string>)[flagCode] || "";
  } else if (country && !flagCode) {
    flagCode = nameToCode[country.toLowerCase()] || "";
  }

  return {
    ...p,
    country,
    flagCode,
    images: {
      cover: toLandingAssetUrl(resolveImageAsset(images.cover)),
      avatar: toLandingAssetUrl(resolveImageAsset(images.avatar)),
      gallery: (images.gallery || []).map((g: any) => toLandingAssetUrl(resolveImageAsset(g))),
    },
  };
}

async function getAllActiveProfiles() {
  const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000/api";
  const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL : `${BACKEND_URL.replace(/\/+$/, '')}/api`;
  try {
    const res = await fetch(`${baseUrl}/profiles`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const profiles = await res.json();
    return profiles.map(normalizeProfile);
  } catch (err) {
    console.error("Failed to fetch profiles:", err);
    return [];
  }
}

function TravellerCard({ profile }: { profile: Profile }) {
  return (
    <article className="flex w-full flex-col items-center gap-4.25 rounded-[20px] border border-black-400 bg-black px-1.25 pb-4.75 pt-1.25 xl:gap-6.5 xl:rounded-2xl xl:px-2 xl:pb-7 xl:pt-2">
      <div className="w-full">
        <div className="flex w-full flex-col items-center pb-6 xl:pb-9">
          <div className="relative -mb-6 h-26.75 w-full overflow-hidden rounded-[14px] xl:-mb-9 xl:h-40 xl:rounded-2xl">
            <LoadedImage
              src={toLandingAssetUrl(profile.images.cover)}
              thumbnailSrc={getOptimizedMediaUrl(toLandingAssetUrl(profile.images.cover))}
              alt={`${profile.name} cover`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="relative z-10 -mb-6 size-13.25 overflow-hidden rounded-[13px] border-[5.333px] border-black xl:-mb-9 xl:size-20 xl:rounded-2xl xl:border-8">
            <LoadedImage
              src={toLandingAssetUrl(profile.images.avatar)}
              thumbnailSrc={getOptimizedMediaUrl(toLandingAssetUrl(profile.images.avatar))}
              alt={profile.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-4 px-2 xl:gap-6 xl:px-3">
        <div className="flex w-full flex-col items-center gap-[5.333px] xl:gap-3">
          <div className="flex w-full items-center justify-center gap-1">
            {profile.flagCode && (
              <img
                src={toFlagAssetPath(profile.flagCode)}
                alt={`${profile.country} flag`}
                className="h-1.5 w-2.5 shrink-0 rounded-xs object-cover xl:h-4 xl:w-6"
              />
            )}
            <p className="text-[9.33px] font-normal leading-none tracking-[-0.056px] whitespace-nowrap text-white-600 xl:text-sm xl:leading-5 xl:tracking-[-0.084px]">
              {profile.country || "Global"}
            </p>
          </div>
          <p className="w-full text-center text-[13.33px] font-semibold leading-[18.667px] tracking-[-0.0667px] text-white ds-font-display xl:text-xl xl:leading-normal xl:tracking-[-0.41px]">
            {profile.name}
          </p>
          <p className="w-full text-center text-[10.67px] font-normal leading-4 tracking-[-0.064px] text-white-400 xl:text-base xl:leading-normal xl:tracking-[-0.096px]">
            {profile.handle}
          </p>
        </div>

        <div className="flex w-full items-center justify-center gap-[26.667px] rounded-xl bg-black-900 px-[13.333px] py-[10.667px] xl:gap-10 xl:px-5 xl:py-4">
          <div className="flex flex-1 flex-col items-center gap-1">
            <p className="text-[13.33px] font-semibold leading-normal tracking-[-0.41px] text-white ds-font-display xl:text-xl">
              {profile.countries || 0}
            </p>
            <p className="text-[8px] font-normal leading-[10.667px] text-white-500 xl:text-xs xl:leading-normal xl:tracking-[-0.5px]">
              Countries
            </p>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1">
            <p className="text-[13.33px] font-semibold leading-normal tracking-[-0.41px] text-white ds-font-display xl:text-xl">
              {profile.media || 0}
            </p>
            <p className="text-[8px] font-normal leading-[10.667px] text-white-500 xl:text-xs xl:leading-normal xl:tracking-[-0.5px]">
              All media
            </p>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1">
            <p className="text-[13.33px] font-semibold leading-normal tracking-[-0.41px] text-white ds-font-display xl:text-xl">
              {profile.collections || 0}
            </p>
            <p className="text-[8px] font-normal leading-[10.667px] text-white-500 xl:text-xs xl:leading-normal xl:tracking-[-0.5px]">
              Collections
            </p>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 xl:gap-3">
          <span className="flex-1 overflow-hidden rounded-full bg-white-50 px-[10.667px] py-[6.667px] text-center text-[9.33px] font-medium leading-[13.333px] tracking-[-0.056px] text-black-950 xl:p-2.5 xl:text-sm xl:leading-normal xl:tracking-[-0.084px]">
            Follow
          </span>
          <span className="flex-1 overflow-hidden rounded-full border border-black-100 bg-black-700 px-[10.667px] py-[6.667px] text-center text-[9.33px] font-medium leading-[13.333px] tracking-[-0.056px] text-white-50 xl:p-2.5 xl:text-sm xl:leading-normal xl:tracking-[-0.084px]">
            Connect
          </span>
        </div>
      </div>
    </article>
  );
}

export default async function FeaturedProfilesPage() {
  const allProfiles = await getAllActiveProfiles();

  return (
    <main>
      <section id="featured" className="px-3 pb-16 pt-16 md:px-12 md:pb-20 md:pt-20 xl:px-24 xl:pb-24 xl:pt-16">
        <div className="mx-auto max-w-250 text-center">
          <h1 className="ds-font-display text-[44px] leading-13 font-semibold text-white tracking-[-1px] md:text-[56px] md:leading-16 md:tracking-[-1px] xl:text-[72px] xl:leading-20 xl:tracking-[0.5px]">
            Featured Profiles
          </h1>
          <p className="mt-6 text-[18px] leading-6.5 tracking-[-0.198px] text-white-400">
            A preview of the featured traveller profiles.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:mt-16 xl:grid-cols-4 xl:gap-8">
          {allProfiles.length > 0 ? (
            allProfiles.map((profile: Profile, index: number) => {
              const username = profile.handle?.startsWith('@') ? profile.handle.slice(1) : profile.handle;
              return (
                <a key={`${profile.id}-${index}`} href={`https://app.travingat.com/${username}`} className="block w-full transition-transform hover:scale-[1.02]">
                  <TravellerCard profile={profile} />
                </a>
              );
            })
          ) : (
            <p className="text-center text-white-400 col-span-full">No active profiles found.</p>
          )}
        </div>
      </section>
    </main>
  );
}
