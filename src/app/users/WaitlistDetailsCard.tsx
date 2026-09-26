import { X } from "lucide-react";

type WaitlistEntry = {
  id: number;
  email: string;
  browser: string;
  device: string;
  country: string;
  city: string;
  ip: string;
  confirmed: boolean;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  source: string;
  explorer_card_status: string;
  get_featured_status: string;
  countries_count: number | null;
  card_style: string | null;
  user_uuid?: string;
  name?: string | null;
  links?: string[] | null;
  featured_countries_count?: number | null;
};

export default function WaitlistDetailsCard({
  entry,
  onClose,
  onMarkFeatured,
  onReject,
}: {
  entry: WaitlistEntry;
  onClose: () => void;
  onMarkFeatured?: (entry: WaitlistEntry) => void;
  onReject?: (entry: WaitlistEntry) => void;
}) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} • ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const getStatusStyle = (status: string | undefined | null) => {
    const s = (status || "").toLowerCase();
    if (s === "confirmed" || s === "created" || s === "approved") {
      return "bg-[#e6f4ea] text-[#137333]";
    }
    if (s === "pending" || s === "not created") {
      return "bg-yellow-500/10 text-yellow-500";
    }
    return "bg-white/10 text-white/70";
  };

  const hasExplorerCard = entry.explorer_card_status?.toLowerCase() === "created";
  const hasFeaturedApp = entry.get_featured_status?.toLowerCase() === "created" || entry.get_featured_status?.toLowerCase() === "approved";

  return (
    <div className="bg-[#161616] border border-[#1e1e1e] border-solid content-stretch drop-shadow-[0px_4px_12px_rgba(0,0,0,0.03)] flex flex-col gap-[16px] items-start p-[28px] relative rounded-[16px] w-[420px] max-h-[100dvh] overflow-y-auto" data-node-id="15600:58254" data-name="View Details Card">
      <div className="content-stretch flex items-center justify-between pb-[8px] relative shrink-0 w-full" data-node-id="15600:58255" data-name="Header">
        <p className="[word-break:break-word] font-semibold leading-[normal] not-italic relative shrink-0 text-[20px] text-white whitespace-nowrap" data-node-id="15600:58256">
          View details
        </p>
        <button onClick={onClose} className="bg-[#111] border border-[#212121] border-solid content-stretch flex gap-[10px] items-center justify-center relative rounded-[8px] shrink-0 size-[36px] hover:bg-[#1a1a1a] transition-colors" data-node-id="15596:76216" data-name="Menu container">
          <X size={20} className="text-white/70 group-hover:text-white transition-colors" />
        </button>
      </div>
      <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-node-id="15600:58259" data-name="Basic Info Section">
        <p className="[word-break:break-word] font-semibold leading-[normal] not-italic relative shrink-0 text-[16px] text-white w-full" data-node-id="15600:58260">
          Basic info
        </p>
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58261" data-name="Info Row">
          <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58262">
            Name
          </p>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="15600:58263" data-name="Value Container">
            <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full" data-node-id="15600:58264">
              {entry.name || "N/A"}
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58265" data-name="Info Row">
          <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58266">
            Email
          </p>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="15600:58267" data-name="Value Container">
            <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full" data-node-id="15600:58268">
              {entry.email}
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58269" data-name="Info Row">
          <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58270">
            Country
          </p>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="15600:58271" data-name="Value Container">
            <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full" data-node-id="15600:58272">
              {entry.country || "N/A"}
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58273" data-name="Info Row">
          <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58274">
            Joined
          </p>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="15600:58275" data-name="Value Container">
            <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full" data-node-id="15600:58276">
              {formatDate(entry.created_at)}
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58277" data-name="Info Row">
          <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58278">
            Source
          </p>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="15600:58279" data-name="Value Container">
            <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full" data-node-id="15600:58280">
              {entry.source || "Waitlist"}
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58281" data-name="Info Row">
          <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58282">
            Waitlist status
          </p>
          <div className={`${entry.confirmed ? 'bg-[#e6f4ea]' : 'bg-yellow-500/10'} content-stretch flex items-start px-[8px] py-[3px] relative rounded-[6px] shrink-0`} data-node-id="15600:58284" data-name="Status Pill">
            <p className={`[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 ${entry.confirmed ? 'text-[#137333]' : 'text-yellow-500'} text-[12px] whitespace-nowrap`} data-node-id="15600:58285">
              {entry.confirmed ? "Confirmed" : "Pending"}
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58286" data-name="Info Row">
          <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58287">
            Email verified
          </p>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="15600:58288" data-name="Value Container">
            <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full" data-node-id="15600:58289">
              {formatDate(entry.confirmed_at)}
            </p>
          </div>
        </div>
      </div>
      <div className="h-[1px] relative shrink-0 w-full bg-[#1e1e1e]" data-node-id="15600:58290" data-name="Line">
      </div>
      <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-node-id="15600:58291" data-name="Explorer Card Section">
        <p className="[word-break:break-word] font-semibold leading-[normal] not-italic relative shrink-0 text-[16px] text-white w-full" data-node-id="15600:58292">
          Explorer Card
        </p>
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58293" data-name="Info Row">
          <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58294">
            Status
          </p>
          <div className={`${hasExplorerCard ? 'bg-[#e6f4ea]' : 'bg-white/10'} content-stretch flex items-start px-[8px] py-[3px] relative rounded-[6px] shrink-0`} data-node-id="15600:58296" data-name="Status Pill">
            <p className={`[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 ${hasExplorerCard ? 'text-[#137333]' : 'text-white/70'} text-[12px] whitespace-nowrap capitalize`} data-node-id="15600:58297">
              {entry.explorer_card_status || "Not created"}
            </p>
          </div>
        </div>
        {hasExplorerCard && (
          <>
            <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58298" data-name="Info Row">
              <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58299">
                Card style
              </p>
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="15600:58300" data-name="Value Container">
                <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full capitalize" data-node-id="15600:58301">
                  {entry.card_style || "Adventure"}
                </p>
              </div>
            </div>
            <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58302" data-name="Info Row">
              <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58303">
                Countries visited
              </p>
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="15600:58304" data-name="Value Container">
                <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full" data-node-id="15600:58305">
                  {entry.countries_count || 0}
                </p>
              </div>
            </div>
            <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58306" data-name="Info Row">
              <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58307">
                View card
              </p>
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="15600:58308" data-name="Value Container">
                <a className="[word-break:break-word] block font-medium leading-[0] not-italic relative shrink-0 text-[#3b82f6] text-[14px] whitespace-nowrap" href={`https://app.travingat.com/view/explorercard/${entry.user_uuid}?style=${(entry.card_style || 'adventure').toLowerCase()}`} data-node-id="15600:58309" target="_blank">
                  <p className="cursor-pointer leading-[normal]">Open card</p>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="h-[1px] relative shrink-0 w-full bg-[#1e1e1e]" data-node-id="15600:58310" data-name="Line">
      </div>
      <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-node-id="15600:58311" data-name="Featured Application Section">
        <p className="[word-break:break-word] font-semibold leading-[normal] not-italic relative shrink-0 text-[16px] text-white w-full" data-node-id="15600:58312">
          Featured Application
        </p>
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58313" data-name="Info Row">
          <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58314">
            Status
          </p>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="15600:58315" data-name="Value Container">
            <div className={`${hasFeaturedApp ? 'bg-[#e8f0fe]' : 'bg-white/10'} content-stretch flex items-start px-[8px] py-[3px] relative rounded-[6px] shrink-0`} data-node-id="15600:58316" data-name="Status Pill">
              <p className={`[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 ${hasFeaturedApp ? 'text-[#1a73e8]' : 'text-white/70'} text-[12px] whitespace-nowrap capitalize`} data-node-id="15600:58317">
                {entry.get_featured_status || "Not created"}
              </p>
            </div>
          </div>
        </div>

        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58318" data-name="Info Row">
          <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58319">
            Applied on
          </p>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="15600:58320" data-name="Value Container">
            <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full" data-node-id="15600:58321">
              {formatDate(entry.updated_at)}
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58322" data-name="Info Row">
          <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58323">
            Countries visited
          </p>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="15600:58324" data-name="Value Container">
            <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full" data-node-id="15600:58325">
              {entry.featured_countries_count ?? "N/A"}
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58326" data-name="Info Row">
          <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58327">
            Links
          </p>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="15600:58328" data-name="Value Container">
            <div className="[word-break:break-word] content-stretch flex flex-col font-medium gap-[6px] items-start leading-[0] not-italic relative shrink-0 text-[14px] w-full" data-node-id="15600:58329" data-name="Links List">
              {entry.links && entry.links.length > 0 ? (
                entry.links.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noreferrer" className="text-[#3b82f6] hover:underline leading-[normal] block truncate w-full">
                    {link}
                  </a>
                ))
              ) : (
                <p className="text-white leading-[normal]">N/A</p>
              )}
            </div>
          </div>
        </div>

        {hasFeaturedApp && entry.get_featured_status?.toLowerCase() === "created" && (
          <div className="content-stretch flex gap-[10px] items-start pt-[8px] relative shrink-0 w-full" data-node-id="15600:58333" data-name="Actions Row">
            <button onClick={() => onMarkFeatured?.(entry)} className="bg-[#e6f4ea] content-stretch flex items-center justify-center px-[16px] py-[10px] relative rounded-[8px] shrink-0 hover:bg-[#c8e6c9] transition-colors" data-node-id="15600:58334" data-name="Mark Featured Button">
              <p className="[word-break:break-word] font-semibold leading-[normal] not-italic relative shrink-0 text-[#137333] text-[14px] whitespace-nowrap" data-node-id="15600:58335">
                Mark as Featured
              </p>
            </button>
            <button onClick={() => onReject?.(entry)} className="bg-white border border-[#dadce0] border-solid content-stretch flex items-center justify-center px-[16px] py-[10px] relative rounded-[8px] shrink-0 hover:bg-gray-100 transition-colors" data-node-id="15600:58336" data-name="Reject Button">
              <p className="[word-break:break-word] font-semibold leading-[normal] not-italic relative shrink-0 text-[#3c4043] text-[14px] whitespace-nowrap" data-node-id="15600:58337">
                Reject
              </p>
            </button>
          </div>
        )}
      </div>
      <div className="h-[1px] relative shrink-0 w-full bg-[#1e1e1e]" data-node-id="15600:58338" data-name="Line">
      </div>
      <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-node-id="15600:58339" data-name="Additional Info Section">
        <p className="[word-break:break-word] font-semibold leading-[normal] not-italic relative shrink-0 text-[16px] text-white w-full" data-node-id="15600:58340">
          Additional info
        </p>
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58341" data-name="Info Row">
          <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58342">
            Device
          </p>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="15600:58343" data-name="Value Container">
            <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full" data-node-id="15600:58344">
              {entry.device || "N/A"}
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58345" data-name="Info Row">
          <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58346">
            Browser
          </p>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="15600:58347" data-name="Value Container">
            <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full" data-node-id="15600:58348">
              {entry.browser || "N/A"}
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58349" data-name="Info Row">
          <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58350">
            Location
          </p>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="15600:58351" data-name="Value Container">
            <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full" data-node-id="15600:58352">
              {[entry.city, entry.country].filter(Boolean).join(", ") || "N/A"}
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58353" data-name="Info Row">
          <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58354">
            IP address
          </p>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="15600:58355" data-name="Value Container">
            <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full" data-node-id="15600:58356">
              {entry.ip || "N/A"}
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="15600:58357" data-name="Info Row">
          <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#cecece] text-[14px] w-[160px]" data-node-id="15600:58358">
            Last seen
          </p>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="15600:58359" data-name="Value Container">
            <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white w-full" data-node-id="15600:58360">
              {formatDate(entry.updated_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
