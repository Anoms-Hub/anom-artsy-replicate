import { Link } from "wouter";
import { ArrowLeft, Shield, Copyright, AlertTriangle, Mail, FileText } from "lucide-react";

const EFFECTIVE_DATE = "July 11, 2026";
const OWNER_NAME = "Eliza Wood";
const OWNER_DBA = "Anom Originals";
const CONTACT_EMAIL = "helloanomoriginals@gmail.com";
const DMCA_EMAIL = "helloanomoriginals@gmail.com";
const PLATFORM_NAME = "Sanctuary";
const PLATFORM_URL = "anomarsty.lol";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0a0015] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <button className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Home
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-bold text-white">Terms of Service &amp; Legal</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">

        {/* Effective date */}
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Last Updated</p>
          <p className="text-slate-300 font-semibold">{EFFECTIVE_DATE}</p>
        </div>

        {/* Copyright Notice — most prominent */}
        <section className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 border border-pink-500/40 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Copyright className="w-6 h-6 text-pink-400 shrink-0" />
            <h2 className="text-xl font-bold text-pink-300">Copyright Notice</h2>
          </div>
          <p className="text-slate-200 leading-relaxed mb-4">
            All content on this platform — including but not limited to the <strong className="text-white">AO Universe</strong>, <strong className="text-white">Sanctuary</strong> platform design and code, <strong className="text-white">Pixel &amp; Dot</strong> animated series, all character designs (including Clifford, Tater Nugget, Security Bot X-9, and the AO Symbol), background art, profile art, digital goods, written lore, world-building materials, coin economy design, mission structures, and all associated creative works — are the exclusive intellectual property of <strong className="text-white">{OWNER_NAME}</strong>, operating as <strong className="text-white">{OWNER_DBA}</strong>.
          </p>
          <div className="bg-black/40 rounded-lg px-4 py-3 border border-pink-500/20 text-center">
            <p className="text-sm text-slate-300">
              <span className="text-pink-400 font-bold">© 2019–2026 {OWNER_NAME} / {OWNER_DBA}.</span> All rights reserved.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              AO Universe™ · Sanctuary™ · Pixel &amp; Dot™ · Anom Originals™
            </p>
          </div>
          <p className="text-sm text-slate-400 mt-4 leading-relaxed">
            These works have been continuously created and published since September 2019. Unauthorized reproduction, distribution, modification, commercial use, or creation of derivative works is strictly prohibited without prior written consent from the copyright holder.
          </p>
        </section>

        {/* Trademark Notice */}
        <section className="bg-black/40 border border-cyan-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-cyan-400 shrink-0" />
            <h2 className="text-xl font-bold text-cyan-300">Trademark Notice</h2>
          </div>
          <p className="text-slate-300 leading-relaxed mb-3">
            The following names, marks, and brand identifiers are claimed as trademarks of <strong className="text-white">{OWNER_NAME} / {OWNER_DBA}</strong> and may not be used in commerce without written permission:
          </p>
          <ul className="space-y-1.5 text-sm text-slate-300 mb-4">
            {["Anom Originals™", "AO Universe™", "Sanctuary™ (platform)", "Pixel & Dot™", "Anom Artsy™", "anomarsty.lol", "anomartsy.xyz"].map((mark) => (
              <li key={mark} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                <span>{mark}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 leading-relaxed">
            Use of these marks in a manner likely to cause confusion as to the source, sponsorship, affiliation, or endorsement of any product or service is prohibited. Trademark registration applications are pending or in preparation with the United States Patent and Trademark Office (USPTO).
          </p>
        </section>

        {/* Acceptance of Terms */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Acceptance of Terms
          </h2>
          <p className="text-slate-300 leading-relaxed text-sm">
            By accessing or using the {PLATFORM_NAME} platform at <strong className="text-white">{PLATFORM_URL}</strong>, you agree to be bound by these Terms of Service. If you do not agree, you may not use this platform. {OWNER_DBA} reserves the right to update these terms at any time, with changes effective upon posting.
          </p>
        </section>

        {/* Permitted and Prohibited Uses */}
        <section className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-5">
            <h3 className="font-bold text-green-300 mb-3 text-sm uppercase tracking-wide">Permitted Uses</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {[
                "Personal, non-commercial enjoyment of the platform",
                "Sharing links to your public profile or platform pages",
                "Creating original content within the platform using provided tools",
                "Participating in missions, games, and community features",
                "Referencing the platform in educational or journalistic contexts with attribution",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-5">
            <h3 className="font-bold text-red-300 mb-3 text-sm uppercase tracking-wide">Prohibited Uses</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {[
                "Reproducing, copying, or distributing platform content commercially",
                "Scraping, crawling, or bulk-downloading platform data",
                "Creating competing products using AO Universe IP or lore",
                "Impersonating Anom Originals, Eliza Wood, or platform staff",
                "Using AI tools to generate derivative works based on platform IP without permission",
                "Reverse engineering the platform's coin economy or game mechanics for commercial use",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* User-Generated Content */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">User-Generated Content</h2>
          <p className="text-slate-300 leading-relaxed text-sm">
            Members retain ownership of original content they create and post on the platform. By posting content, you grant {OWNER_DBA} a non-exclusive, royalty-free license to display, distribute, and promote your content within the platform. You represent that you own or have the rights to any content you post, and that it does not infringe on the rights of any third party.
          </p>
          <p className="text-slate-300 leading-relaxed text-sm">
            {OWNER_DBA} reserves the right to remove content that violates these terms, infringes on intellectual property rights, or is otherwise harmful to the community.
          </p>
        </section>

        {/* Coin Economy Disclaimer */}
        <section className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-300 mb-2">Coin Economy Disclaimer</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                AO Coins are a virtual in-platform currency with no real-world monetary value. They cannot be exchanged for cash, transferred between accounts, or redeemed outside the platform. {OWNER_DBA} reserves the right to modify, suspend, or discontinue the coin economy at any time without liability.
              </p>
            </div>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">Limitation of Liability</h2>
          <p className="text-slate-300 leading-relaxed text-sm">
            The {PLATFORM_NAME} platform is provided "as is" without warranties of any kind. {OWNER_DBA} shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform. The platform is operated by a solo independent creator and is not affiliated with any corporation or large entity.
          </p>
        </section>

        {/* DMCA / Copyright Infringement */}
        <section className="bg-black/40 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-purple-300">DMCA &amp; Copyright Infringement Reports</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            If you believe that content on this platform infringes your copyright, or if you wish to report unauthorized use of {OWNER_DBA}'s intellectual property elsewhere on the internet, please send a written notice to:
          </p>
          <div className="bg-black/60 rounded-lg px-4 py-3 border border-purple-500/20">
            <p className="text-sm text-white font-semibold">{OWNER_NAME} / {OWNER_DBA}</p>
            <p className="text-sm text-purple-300">DMCA Agent &amp; Copyright Contact</p>
            <a href={`mailto:${DMCA_EMAIL}`} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
              {DMCA_EMAIL}
            </a>
          </div>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
            Your notice must include: identification of the copyrighted work, identification of the infringing material and its location, your contact information, a statement of good faith belief, and a statement of accuracy under penalty of perjury.
          </p>
        </section>

        {/* Contact */}
        <section className="text-center space-y-2 pb-4">
          <p className="text-sm text-slate-400">Questions about these terms?</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-semibold">
            {CONTACT_EMAIL}
          </a>
          <p className="text-xs text-slate-600 mt-4">
            © 2019–2026 {OWNER_NAME} / {OWNER_DBA}. All rights reserved. · {PLATFORM_URL}
          </p>
        </section>

      </div>
    </div>
  );
}
