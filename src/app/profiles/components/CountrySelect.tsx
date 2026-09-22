"use client";

import { useState, useEffect, useRef } from "react";
import { COUNTRY_LIST } from "@/lib/countries";
import { Input } from "@/components/ui/Input";

export default function CountrySelect({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (code: string, name: string, flag: string) => void;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = COUNTRY_LIST.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const selected = COUNTRY_LIST.find((c) => c.code === value);

  return (
    <div ref={ref} className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {label && <label className="text-sm text-white/60 block mb-1.5">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-left flex items-center gap-2 hover:border-white/20 transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        {selected ? (
          <>
            <img
              src={`/flags/${selected.code}.svg`}
              alt={selected.name}
              className="w-5 h-3.5 rounded-sm object-cover"
            />
            <span className="text-white">{selected.name}</span>
            <span className="text-white/30 ml-auto">{selected.code}</span>
          </>
        ) : (
          <span className="text-white/25">Select country...</span>
        )}
      </button>
      {open && (
        <div className="absolute z-[100] mt-1 w-full bg-[#1C1C1C] border border-white/10 rounded-lg shadow-xl max-h-60 flex flex-col">
          <div className="p-2 border-b border-white/10 shrink-0">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="bg-white/5 border border-white/10 text-sm placeholder:text-white/25 focus:border-[#5A45F9]"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-white/30">
                No countries found
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onChange(c.code, c.name, c.flag);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer ${value === c.code ? "bg-[#5A45F9]/20 text-white" : "text-white/70"
                    }`}
                >
                  <img
                    src={`/flags/${c.code}.svg`}
                    alt={c.name}
                    className="w-5 h-3.5 rounded-sm object-cover"
                  />
                  <span>{c.name}</span>
                  <span className="text-white/30 ml-auto text-xs">{c.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
