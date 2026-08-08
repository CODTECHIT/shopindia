const fs = require('fs');
const file = 'src/components/mobile/VerticalServicesMobile.tsx';
let content = fs.readFileSync(file, 'utf8');

// Container
content = content.replace('bg-[#1C1C1E] text-zinc-350', 'bg-[#FAF9F6] text-brand-slate');

// Top Banner Box
content = content.replace('bg-zinc-900 border border-zinc-800', 'bg-white border border-brand-border');
content = content.replace('bg-services-gold/10 border border-services-gold/20 text-services-gold', 'bg-amber-50 border border-amber-200 text-amber-700');
content = content.replace('text-white mt-2', 'text-brand-graphite mt-2');
content = content.replace('text-zinc-400 font-bold', 'text-brand-slate font-bold');
content = content.replace('text-services-gold', 'text-amber-500'); // ShieldCheck

// Category circular
content = content.replace('bg-zinc-900 transition-all shadow-soft', 'bg-white transition-all shadow-soft');
content = content.replace(
  "selectedCategory === cat.id ? 'border-services-gold' : 'border-zinc-800'",
  "selectedCategory === cat.id ? 'border-amber-500 ring-2 ring-amber-100' : 'border-brand-border'"
);
content = content.replace(
  "selectedCategory === cat.id ? 'text-services-gold' : 'text-zinc-550'",
  "selectedCategory === cat.id ? 'text-amber-600' : 'text-brand-slate'"
);

// Recommended Packages
content = content.replace('text-zinc-450 uppercase font-black', 'text-brand-slate uppercase font-black');

// Services List Feed Cards
content = content.replace(/bg-zinc-900 border border-zinc-850/g, 'bg-white border border-brand-border');
content = content.replace(/bg-zinc-950\/60 text-zinc-450 hover:text-brand-red border border-zinc-800/g, 'bg-white/95 text-zinc-400 hover:text-brand-red border border-brand-border');

content = content.replace(/text-white line-clamp-1/g, 'text-brand-graphite line-clamp-1');
content = content.replace(/bg-services-gold text-\[#1C1C1E\]/g, 'bg-amber-100 text-amber-800');
content = content.replace(/fill-\[#1C1C1E\] text-\[#1C1C1E\]/g, 'fill-amber-800 text-amber-800');
content = content.replace(/text-zinc-400/g, 'text-brand-slate');

content = content.replace(/text-white/g, 'text-brand-graphite'); // for price
content = content.replace(/text-zinc-550/g, 'text-brand-slate');
content = content.replace(/text-services-gold font-black bg-services-gold\/10/g, 'text-amber-600 font-black bg-amber-50');
content = content.replace(/border-services-gold\/10/g, 'border-amber-200');

content = content.replace(/bg-neutral-900 border border-zinc-800/g, 'bg-brand-elevated border border-brand-border\/40');
content = content.replace(/bg-services-gold text-brand-graphite font-extrabold/g, 'bg-amber-100 text-amber-800 border border-amber-200 font-extrabold');

// Bottom sheet
content = content.replace(/bg-black\/80/g, 'bg-black/40');
content = content.replace(/bg-zinc-900 border-t border-zinc-800/g, 'bg-white border-t border-brand-border');
content = content.replace(/text-zinc-300/g, 'text-brand-graphite');
content = content.replace(/border-b border-zinc-800/g, 'border-b border-brand-border');

// Drawer text
content = content.replace(/text-services-gold/g, 'text-amber-500'); // calendar icon and dates
content = content.replace(/text-zinc-450/g, 'text-brand-slate');
content = content.replace(/border-services-gold bg-services-gold\/10 text-amber-500/g, 'border-amber-500 bg-amber-50 text-amber-600');
content = content.replace(/border-zinc-850 bg-zinc-950/g, 'border-brand-border bg-brand-elevated');

content = content.replace(/bg-services-gold hover:bg-services-gold\/90 text-brand-graphite/g, 'bg-amber-500 hover:bg-amber-600 text-white');


fs.writeFileSync(file, content);
console.log('Done replacement');
