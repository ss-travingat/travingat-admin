import React from "react";

type AdminUser = {
  id: string;
  email: string;
  username: string;
  display_name: string;
  based_in: string;
  countries_traveled: number;
  onboarded: boolean;
  auth_provider: string;
  avatar_url: string;
  cover_image_url: string;
  total_media_count: number;
  image_count: number;
  video_count: number;
  storage_bytes: number;
  last_active_at: string;
  activity_events_30d: number;
  active_days_30d: number;
  weekly_frequency: number;
  status: "active" | "disabled";
  disabled_at?: string;
  disabled_reason: string;
  created_at: string;
  has_explorer_card?: boolean;
  card_style?: string;
};

export default function AdminDetailsTable({
  user,
  onClose,
  onDelete,
  processing,
}: {
  user: AdminUser;
  onClose: () => void;
  onDelete: (u: AdminUser) => void;
  processing: boolean;
}) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const nameParts = (user.display_name || "N/A").split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || "N/A";

  const TableRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <>
      <div className="bg-[#2b2b2b] h-px relative shrink-0 w-full" data-name="Divider" />
      <div className="content-stretch flex min-h-[44px] items-center overflow-clip px-[20px] relative shrink-0 w-full hover:bg-white/[0.02]" data-name={`Row - ${label}`}>
        <div className="content-stretch flex min-h-[20px] items-center overflow-clip relative shrink-0 w-[160px]" data-name="Cell - Column">
          <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[#7d7d7d] text-[14px] whitespace-nowrap">
            {label}
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip relative py-2" data-name="Cell - Value">
          <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
            {value}
          </p>
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-black border border-black border-solid flex flex-col items-start overflow-clip relative rounded-[8px] w-[460px] max-h-[100dvh] shadow-[20px_20px_40px_rgba(0,0,0,0.40)]">
      <div className="flex items-center justify-between px-[20px] py-[16px] w-full bg-black z-10 shrink-0 border-b border-[#2b2b2b]">
        <h2 className="text-xl font-bold text-white">Details</h2>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-md p-1.5 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="w-full overflow-y-auto flex-1 bg-black border border-black border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[8px] size-full" data-node-id="15597:29167" data-name="Table">
        <div className="content-stretch flex h-[44px] items-center overflow-clip px-[20px] relative shrink-0 w-full" data-node-id="15597:29168" data-name="Header Row">
          <div className="content-stretch flex h-[20px] items-center overflow-clip relative shrink-0 w-[160px]" data-node-id="15597:29170" data-name="Cell - Column">
            <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[#7d7d7d] text-[14px] whitespace-nowrap" data-node-id="15597:29169">
              Column
            </p>
          </div>
          <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip relative" data-node-id="15597:29172" data-name="Cell - Value">
            <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap" data-node-id="15597:29171">
              Values/example
            </p>
          </div>
        </div>

        <TableRow label="#" value={user.id} />
        <TableRow label="Email" value={<a href={`mailto:${user.email}`} className="text-[#3b82f6] hover:underline">{user.email} ↗</a>} />
        <TableRow label="First Name" value={firstName} />
        <TableRow label="Last Name" value={lastName} />
        <TableRow label="Country" value={user.based_in || "N/A"} />
        <TableRow label="Source" value={"Admin Portal"} />
        <TableRow label="Explorer Card" value={user.has_explorer_card ? "Created" : "Not Created"} />
        <TableRow label="Card Style" value={user.card_style || "—"} />
        <TableRow label="Featured" value={"Not Applied"} />
        <TableRow label="Countries" value={user.countries_traveled} />
        <TableRow label="Status" value={user.status} />
        <TableRow label="Joined" value={formatDate(user.created_at)} />
        <TableRow label="Device" value={"N/A"} />
        <TableRow label="Browser" value={"N/A"} />
        <TableRow label="Location" value={user.based_in || "N/A"} />

        <div className="bg-[#2b2b2b] h-px relative shrink-0 w-full" data-node-id="15597:29239" data-name="Divider" />
        <div className="content-stretch flex min-h-[44px] items-center overflow-clip px-[20px] relative shrink-0 w-full" data-node-id="15597:29240" data-name="Row - Actions">
          <div className="content-stretch flex min-h-[20px] items-center overflow-clip relative shrink-0 w-[160px]" data-node-id="15597:29242" data-name="Cell - Column">
            <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[#7d7d7d] text-[14px] whitespace-nowrap" data-node-id="15597:29241">
              Actions
            </p>
          </div>
          <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip relative py-4 gap-3" data-node-id="15597:29244" data-name="Cell - Value">
            <a
              href={`https://app.travingat.com/profiles/${user.username || user.id}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-[#2A2A2A] hover:bg-[#333333] text-white text-[13px] font-medium rounded-lg transition-colors"
            >
              View Profile
            </a>
            <button
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[13px] font-medium rounded-lg transition-colors"
              onClick={() => onDelete(user)}
              disabled={processing}
            >
              {processing ? "Deleting..." : "Delete User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
