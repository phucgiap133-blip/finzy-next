"use client";

import { useState, useMemo } from "react";
import Header from "../../../components/Header";
import Card from "../../../components/Card";
import PageContainer from "../../../components/PageContainer";

const BANKS = [
  { code: "VCB",  name: "Vietcombank",        logo: "https://logo.clearbit.com/vietcombank.com.vn" },
  { code: "CTG",  name: "VietinBank",         logo: "https://logo.clearbit.com/vietinbank.vn" },
  { code: "BIDV", name: "BIDV",               logo: "https://logo.clearbit.com/bidv.com.vn" },
  { code: "AGR",  name: "Agribank",           logo: "https://logo.clearbit.com/agribank.com.vn" },
  { code: "TCB",  name: "Techcombank",        logo: "https://logo.clearbit.com/techcombank.com.vn" },
  { code: "MBB",  name: "MB Bank",            logo: "https://logo.clearbit.com/mbbank.com.vn" },
  { code: "ACB",  name: "ACB",                logo: "https://logo.clearbit.com/acb.com.vn" },
  { code: "STB",  name: "Sacombank",          logo: "https://logo.clearbit.com/sacombank.com.vn" },
  { code: "VPB",  name: "VPBank",             logo: "https://logo.clearbit.com/vpbank.com.vn" },
  { code: "TPB",  name: "TPBank",             logo: "https://logo.clearbit.com/tpbank.com.vn" },
  { code: "VIB",  name: "VIB",                logo: "https://logo.clearbit.com/vib.com.vn" },
  { code: "SHB",  name: "SHB",                logo: "https://logo.clearbit.com/shb.com.vn" },
  { code: "OCB",  name: "OCB",                logo: "https://logo.clearbit.com/ocb.com.vn" },
  { code: "EIB",  name: "Eximbank",           logo: "https://logo.clearbit.com/eximbank.com.vn" },
  { code: "SCB",  name: "SCB",                logo: "https://logo.clearbit.com/scb.com.vn" },
  { code: "SEAB", name: "SeaBank",            logo: "https://logo.clearbit.com/seabank.com.vn" },
  { code: "VCBI", name: "VietCapital Bank",   logo: "https://logo.clearbit.com/vietcapitalbank.com.vn" },
  { code: "BAB",  name: "BacABank",           logo: "https://logo.clearbit.com/bacabank.com.vn" },
  { code: "NCB",  name: "NCB",                logo: "https://logo.clearbit.com/ncb-bank.vn" },
  { code: "PVCOM",name: "PVComBank",          logo: "https://logo.clearbit.com/pvcombank.com.vn" },
  { code: "KLB",  name: "KienlongBank",       logo: "https://logo.clearbit.com/kienlongbank.com" },
  { code: "NAB",  name: "Nam Á Bank",         logo: "https://logo.clearbit.com/namabank.com.vn" },
  { code: "MSB",  name: "Maritime Bank",      logo: "https://logo.clearbit.com/msb.com.vn" },
  { code: "ABB",  name: "ABBANK",             logo: "https://logo.clearbit.com/abbank.vn" },
  { code: "HDB",  name: "HDBank",             logo: "https://logo.clearbit.com/hdbank.com.vn" },
];

const norm = (s: string) =>
  (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

export default function SelectBankPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = norm(query);
    if (!q) return BANKS;
    return BANKS.filter((b) => norm(b.name).includes(q) || norm(b.code).includes(q));
  }, [query]);

  return (
    <>
      <Header title="Chọn ngân hàng" showBack noLine backFallback="/banks" />
      <PageContainer className="space-y-md">
        <Card>
          <input
            type="text"
            placeholder="Tìm: 'viet', 'tech', 'nam a', 'tpb'…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-md py-sm border border-border rounded-control mb-md text-body"
            aria-label="Tìm ngân hàng"
          />

          <div className="text-caption text-text-muted mb-sm">
            Tìm thấy {filtered.length} ngân hàng
          </div>

          <div className="divide-y divide-border">
            {filtered.map((b) => (
              <button
                key={b.code}
                className="w-full flex items-center gap-sm py-sm hover:bg-[color:#FAFAFA] text-left"
                onClick={() => alert(`Chọn ${b.name}`)}
              >
                <img
                  src={b.logo}
                  alt={b.name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <div className="flex-1">
                  <div className="text-body font-medium">{b.name}</div>
                  <div className="text-caption text-text-muted">{b.code}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </PageContainer>
    </>
  );
}
