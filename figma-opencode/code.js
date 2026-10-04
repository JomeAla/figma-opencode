const C = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  secondary: "#7C3AED",
  accent: "#06B6D4",
  bg: "#FFFFFF",
  surface: "#F8FAFC",
  surfaceAlt: "#EEF2F7",
  border: "#E2E8F0",
  text: "#0F172A",
  muted: "#64748B",
  slate: "#94A3B8",
  tint: "#DBEAFE",
  white: "#FFFFFF",
  dark: "#0B1120",
  green: "#10B981",
  amber: "#F59E0B",
};

const FONT_FAMILY = "Inter";

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  };
}

function solid(hex) {
  return [{ type: "SOLID", color: hexToRgb(hex) }];
}

async function loadFonts() {
  const styles = ["Regular", "Medium", "Semi Bold", "Bold"];
  await Promise.all(
    styles.map((style) => figma.loadFontAsync({ family: FONT_FAMILY, style }))
  );
}

function text(chars, opts = {}) {
  const t = figma.createText();
  t.fontName = { family: FONT_FAMILY, style: opts.style || "Regular" };
  t.characters = chars;
  t.fontSize = opts.size || 14;
  t.fills = solid(opts.color || C.text);
  if (opts.align) t.textAlignHorizontal = opts.align;
  if (opts.lineHeight) t.lineHeight = { value: opts.lineHeight, unit: "PIXELS" };
  return t;
}

function paragraph(chars, width, opts = {}) {
  const t = text(chars, opts);
  t.textAutoResize = "HEIGHT";
  t.resize(width, t.height);
  return t;
}

function bar(w, h, color, radius) {
  const r = figma.createRectangle();
  r.resize(w, h);
  r.fills = solid(color || C.text);
  r.cornerRadius = radius != null ? radius : 2;
  return r;
}

function circle(size, color, outlined) {
  const e = figma.createEllipse();
  e.resize(size, size);
  if (outlined) {
    e.fills = [];
    e.strokes = solid(color || C.text);
    e.strokeWeight = 2;
  } else {
    e.fills = solid(color || C.text);
  }
  return e;
}

function autoFrame(name, dir, opts = {}) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = dir;
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.itemSpacing = opts.spacing != null ? opts.spacing : 0;
  f.fills = opts.fill ? solid(opts.fill) : [];
  f.clipsContent = false;

  const pad = opts.pad || 0;
  f.paddingTop = opts.padTop != null ? opts.padTop : pad;
  f.paddingRight = opts.padRight != null ? opts.padRight : pad;
  f.paddingBottom = opts.padBottom != null ? opts.padBottom : pad;
  f.paddingLeft = opts.padLeft != null ? opts.padLeft : pad;

  if (opts.align) f.primaryAxisAlignItems = opts.align;
  if (opts.cross) f.counterAxisAlignItems = opts.cross;

  if (opts.radius != null) f.cornerRadius = opts.radius;
  if (opts.stroke) {
    f.strokes = solid(opts.stroke);
    f.strokeWeight = opts.strokeWeight || 1;
  }

  const horizontal = dir === "HORIZONTAL";
  if (opts.w != null || opts.h != null) {
    f.primaryAxisSizingMode = "FIXED";
    f.counterAxisSizingMode = "FIXED";
    f.resize(opts.w != null ? opts.w : f.width, opts.h != null ? opts.h : f.height);
    if (opts.w == null) {
      if (horizontal) f.primaryAxisSizingMode = "AUTO";
      else f.counterAxisSizingMode = "AUTO";
    }
    if (opts.h == null) {
      if (horizontal) f.counterAxisSizingMode = "AUTO";
      else f.primaryAxisSizingMode = "AUTO";
    }
  }

  if (opts.grow) f.layoutGrow = opts.grow;
  if (opts.stretch) f.layoutAlign = "STRETCH";
  return f;
}

function imageBlock(height, label) {
  const f = autoFrame("Image", "VERTICAL", {
    h: height,
    fill: C.surfaceAlt,
    radius: 12,
    align: "CENTER",
    cross: "CENTER",
    stretch: true,
  });
  f.appendChild(text(label || "Image", { size: 12, color: C.muted }));
  return f;
}

function primaryButton(label) {
  const f = autoFrame("Button / " + label, "HORIZONTAL", {
    padTop: 14,
    padBottom: 14,
    padLeft: 22,
    padRight: 22,
    spacing: 8,
    fill: C.primary,
    radius: 10,
    align: "CENTER",
    cross: "CENTER",
  });
  f.appendChild(text(label, { size: 15, style: "Semi Bold", color: C.white }));
  return f;
}

function ghostButton(label) {
  const f = autoFrame("Button / " + label, "HORIZONTAL", {
    padTop: 14,
    padBottom: 14,
    padLeft: 22,
    padRight: 22,
    radius: 10,
    stroke: C.border,
    align: "CENTER",
    cross: "CENTER",
  });
  f.appendChild(text(label, { size: 15, style: "Semi Bold" }));
  return f;
}

function hamburger(color) {
  const f = autoFrame("Menu", "VERTICAL", { spacing: 4, cross: "CENTER" });
  f.appendChild(bar(20, 2, color || C.text, 1));
  f.appendChild(bar(20, 2, color || C.text, 1));
  f.appendChild(bar(13, 2, color || C.text, 1));
  return f;
}

function featureIcon(color) {
  const f = autoFrame("Icon", "VERTICAL", {
    w: 44,
    h: 44,
    radius: 12,
    fill: color,
    align: "CENTER",
    cross: "CENTER",
  });
  f.appendChild(bar(18, 18, C.white, 4));
  return f;
}

function mobileStatusBar() {
  const f = autoFrame("Status Bar", "HORIZONTAL", {
    h: 44,
    padLeft: 24,
    padRight: 24,
    cross: "CENTER",
    fill: C.white,
    stretch: true,
  });
  f.primaryAxisAlignItems = "SPACE_BETWEEN";
  f.appendChild(text("9:41", { size: 14, style: "Semi Bold" }));

  const icons = autoFrame("Status Icons", "HORIZONTAL", { spacing: 8, cross: "CENTER" });
  const signal = autoFrame("Signal", "HORIZONTAL", { spacing: 2, cross: "MAX", h: 12 });
  [4, 7, 10].forEach((h) => signal.appendChild(bar(3, h, C.text, 1)));
  icons.appendChild(signal);
  icons.appendChild(circle(12, C.text, true));
  const battery = autoFrame("Battery", "HORIZONTAL", { spacing: 2, cross: "CENTER" });
  battery.appendChild(bar(20, 11, C.text, 3));
  battery.appendChild(bar(2, 5, C.text, 1));
  icons.appendChild(battery);
  f.appendChild(icons);
  return f;
}

function mobileTopBar() {
  const f = autoFrame("Top Bar", "HORIZONTAL", {
    padLeft: 20,
    padRight: 20,
    padTop: 16,
    padBottom: 16,
    spacing: 12,
    cross: "CENTER",
    fill: C.white,
    stretch: true,
  });
  f.primaryAxisAlignItems = "SPACE_BETWEEN";

  const left = autoFrame("Left", "HORIZONTAL", { spacing: 14, cross: "CENTER" });
  left.appendChild(hamburger());
  left.appendChild(text("OpenCode", { size: 20, style: "Bold" }));
  f.appendChild(left);

  const right = autoFrame("Right", "HORIZONTAL", { spacing: 12, cross: "CENTER" });
  right.appendChild(circle(20, C.muted, true));
  right.appendChild(circle(32, C.primary, false));
  f.appendChild(right);
  return f;
}

function mobileSearchBar() {
  const wrap = autoFrame("Search Section", "VERTICAL", {
    padLeft: 20,
    padRight: 20,
    padTop: 8,
    padBottom: 8,
    fill: C.white,
    stretch: true,
  });
  const field = autoFrame("Input", "HORIZONTAL", {
    pad: 14,
    spacing: 10,
    cross: "CENTER",
    fill: C.surfaceAlt,
    radius: 12,
    stretch: true,
  });
  field.appendChild(circle(16, C.muted, true));
  field.appendChild(text("Search anything...", { size: 14, color: C.muted }));
  wrap.appendChild(field);
  return wrap;
}

function mobileHero() {
  const f = autoFrame("Hero", "VERTICAL", {
    pad: 24,
    spacing: 14,
    fill: C.primary,
    stretch: true,
  });
  f.appendChild(paragraph("Build designs faster", 320, { size: 28, style: "Bold", color: C.white, lineHeight: 34 }));
  f.appendChild(paragraph("Generate mobile and web UI one section at a time.", 320, { size: 15, color: C.tint, lineHeight: 22 }));
  const btn = autoFrame("CTA", "HORIZONTAL", {
    padTop: 12,
    padBottom: 12,
    padLeft: 20,
    padRight: 20,
    fill: C.white,
    radius: 10,
    align: "CENTER",
    cross: "CENTER",
  });
  btn.appendChild(text("Get started", { size: 15, style: "Semi Bold", color: C.primary }));
  f.appendChild(btn);
  return f;
}

function mobileSectionTitle() {
  const wrap = autoFrame("Section Title", "VERTICAL", {
    padLeft: 20,
    padRight: 20,
    padTop: 24,
    padBottom: 8,
    spacing: 4,
    stretch: true,
  });
  wrap.appendChild(text("Popular now", { size: 20, style: "Bold" }));
  wrap.appendChild(text("Hand-picked for you", { size: 13, color: C.muted }));
  return wrap;
}

function mobileCard() {
  const wrap = autoFrame("Card Section", "VERTICAL", {
    padLeft: 20,
    padRight: 20,
    padTop: 8,
    padBottom: 8,
    stretch: true,
  });
  const card = autoFrame("Card", "VERTICAL", {
    pad: 16,
    spacing: 12,
    fill: C.white,
    stroke: C.border,
    radius: 16,
    stretch: true,
  });
  card.appendChild(imageBlock(140, "Cover image"));
  card.appendChild(text("Card title", { size: 17, style: "Semi Bold" }));
  card.appendChild(paragraph("Short supporting description for this card.", 300, { size: 14, color: C.muted, lineHeight: 20 }));
  wrap.appendChild(card);
  return wrap;
}

function mobileListItem() {
  const wrap = autoFrame("List Section", "VERTICAL", {
    padLeft: 20,
    padRight: 20,
    padTop: 8,
    padBottom: 8,
    stretch: true,
  });
  const row = autoFrame("List Item", "HORIZONTAL", {
    pad: 12,
    spacing: 12,
    cross: "CENTER",
    fill: C.white,
    stroke: C.border,
    radius: 14,
    stretch: true,
  });
  row.appendChild(circle(44, C.surfaceAlt, false));
  const col = autoFrame("Text", "VERTICAL", { spacing: 4, grow: 1 });
  col.appendChild(text("Jane Cooper", { size: 15, style: "Semi Bold" }));
  col.appendChild(text("Product designer", { size: 13, color: C.muted }));
  row.appendChild(col);
  row.appendChild(circle(18, C.muted, true));
  wrap.appendChild(row);
  return wrap;
}

function mobileGrid() {
  const wrap = autoFrame("Grid Section", "VERTICAL", {
    padLeft: 20,
    padRight: 20,
    padTop: 8,
    padBottom: 8,
    stretch: true,
  });
  const grid = autoFrame("Grid", "HORIZONTAL", { spacing: 12, stretch: true });
  for (let i = 1; i <= 2; i++) {
    const cell = autoFrame("Cell " + i, "VERTICAL", {
      pad: 12,
      spacing: 8,
      fill: C.surface,
      radius: 14,
      grow: 1,
    });
    cell.appendChild(imageBlock(90, ""));
    cell.appendChild(text("Item " + i, { size: 14, style: "Semi Bold" }));
    cell.appendChild(text("$19.00", { size: 13, color: C.muted }));
    grid.appendChild(cell);
  }
  wrap.appendChild(grid);
  return wrap;
}

function mobileBottomNav() {
  const f = autoFrame("Bottom Navigation", "HORIZONTAL", {
    h: 68,
    padLeft: 16,
    padRight: 16,
    padTop: 10,
    padBottom: 10,
    fill: C.white,
    stroke: C.border,
    stretch: true,
  });
  f.primaryAxisAlignItems = "SPACE_BETWEEN";
  const tabs = ["Home", "Search", "Saved", "Profile"];
  tabs.forEach((label, i) => {
    const active = i === 0;
    const item = autoFrame("Tab / " + label, "VERTICAL", {
      spacing: 4,
      cross: "CENTER",
      grow: 1,
    });
    item.appendChild(bar(20, 20, active ? C.primary : C.muted, 5));
    item.appendChild(text(label, { size: 11, style: active ? "Semi Bold" : "Regular", color: active ? C.primary : C.muted }));
    f.appendChild(item);
  });
  return f;
}

function mobileFab() {
  const wrap = autoFrame("FAB Section", "HORIZONTAL", {
    padLeft: 20,
    padRight: 20,
    padTop: 8,
    padBottom: 24,
    align: "MAX",
    stretch: true,
  });
  const fab = autoFrame("FAB", "VERTICAL", {
    w: 56,
    h: 56,
    radius: 28,
    fill: C.primary,
    align: "CENTER",
    cross: "CENTER",
  });
  fab.appendChild(text("+", { size: 26, style: "Bold", color: C.white }));
  wrap.appendChild(fab);
  return wrap;
}

function webNavbar() {
  const f = autoFrame("Navbar", "HORIZONTAL", {
    padLeft: 48,
    padRight: 48,
    padTop: 20,
    padBottom: 20,
    cross: "CENTER",
    fill: C.white,
    stroke: C.border,
    stretch: true,
  });
  f.primaryAxisAlignItems = "SPACE_BETWEEN";

  const brand = autoFrame("Brand", "HORIZONTAL", { spacing: 10, cross: "CENTER" });
  brand.appendChild(bar(24, 24, C.primary, 7));
  brand.appendChild(text("OpenCode", { size: 20, style: "Bold" }));
  f.appendChild(brand);

  const links = autoFrame("Links", "HORIZONTAL", { spacing: 28, cross: "CENTER" });
  ["Product", "Solutions", "Pricing", "Docs"].forEach((l) =>
    links.appendChild(text(l, { size: 15, color: C.muted }))
  );
  f.appendChild(links);

  const cta = autoFrame("CTA", "HORIZONTAL", {
    padTop: 10,
    padBottom: 10,
    padLeft: 18,
    padRight: 18,
    fill: C.primary,
    radius: 8,
    align: "CENTER",
    cross: "CENTER",
  });
  cta.appendChild(text("Get started", { size: 14, style: "Semi Bold", color: C.white }));
  f.appendChild(cta);
  return f;
}

function webHero() {
  const f = autoFrame("Hero", "VERTICAL", {
    pad: 80,
    spacing: 20,
    fill: C.surface,
    align: "CENTER",
    cross: "CENTER",
    stretch: true,
  });
  f.appendChild(paragraph("Design at the speed of thought", 800, { size: 52, style: "Bold", align: "CENTER", lineHeight: 60 }));
  f.appendChild(paragraph("Create mobile and web interfaces in Figma, one component at a time.", 640, { size: 18, color: C.muted, align: "CENTER", lineHeight: 28 }));

  const row = autoFrame("Actions", "HORIZONTAL", { spacing: 12, cross: "CENTER" });
  row.appendChild(primaryButton("Start building"));
  row.appendChild(ghostButton("View demo"));
  f.appendChild(row);
  return f;
}

function webLogoCloud() {
  const f = autoFrame("Logo Cloud", "HORIZONTAL", {
    padTop: 32,
    padBottom: 32,
    padLeft: 80,
    padRight: 80,
    spacing: 48,
    cross: "CENTER",
    fill: C.surface,
    stretch: true,
  });
  f.primaryAxisAlignItems = "SPACE_BETWEEN";
  ["Northwind", "Globex", "Initech", "Umbrella", "Soylent"].forEach((name) =>
    f.appendChild(text(name, { size: 18, style: "Bold", color: C.muted }))
  );
  return f;
}

function webFeatures() {
  const f = autoFrame("Features", "VERTICAL", {
    pad: 80,
    spacing: 40,
    fill: C.white,
    stretch: true,
  });

  const head = autoFrame("Head", "VERTICAL", { spacing: 10, cross: "CENTER", stretch: true });
  head.appendChild(text("Everything you need", { size: 36, style: "Bold" }));
  head.appendChild(text("Composable building blocks for rapid UI.", { size: 16, color: C.muted }));
  f.appendChild(head);

  const row = autoFrame("Grid", "HORIZONTAL", { spacing: 24, stretch: true });
  const features = [
    { title: "Fast", body: "Generate sections instantly.", color: C.primary },
    { title: "Composable", body: "Mix and match blocks.", color: C.secondary },
    { title: "Themeable", body: "Swap colors and type.", color: C.accent },
  ];
  features.forEach((feat) => {
    const card = autoFrame("Feature / " + feat.title, "VERTICAL", {
      pad: 28,
      spacing: 12,
      fill: C.surface,
      radius: 16,
      grow: 1,
    });
    card.appendChild(featureIcon(feat.color));
    card.appendChild(text(feat.title, { size: 20, style: "Semi Bold" }));
    card.appendChild(paragraph(feat.body, 260, { size: 15, color: C.muted, lineHeight: 22 }));
    row.appendChild(card);
  });
  f.appendChild(row);
  return f;
}

function webPricing() {
  const f = autoFrame("Pricing", "VERTICAL", {
    pad: 80,
    spacing: 40,
    fill: C.white,
    stretch: true,
  });

  const head = autoFrame("Head", "VERTICAL", { spacing: 10, cross: "CENTER", stretch: true });
  head.appendChild(text("Simple pricing", { size: 36, style: "Bold" }));
  head.appendChild(text("Start free, upgrade when you scale.", { size: 16, color: C.muted }));
  f.appendChild(head);

  const row = autoFrame("Plans", "HORIZONTAL", { spacing: 24, stretch: true });
  const plans = [
    { name: "Starter", price: "$0", items: ["1 project", "Community support"], highlight: false },
    { name: "Pro", price: "$24", items: ["Unlimited projects", "Priority support", "Shared libraries"], highlight: true },
    { name: "Team", price: "$79", items: ["Everything in Pro", "SSO", "Admin controls"], highlight: false },
  ];
  plans.forEach((plan) => {
    const card = autoFrame("Plan / " + plan.name, "VERTICAL", {
      pad: 28,
      spacing: 16,
      radius: 18,
      grow: 1,
      fill: plan.highlight ? C.primary : C.surface,
      stroke: plan.highlight ? C.primary : C.border,
    });
    const fg = plan.highlight ? C.white : C.text;
    const sub = plan.highlight ? C.tint : C.muted;
    card.appendChild(text(plan.name, { size: 16, style: "Semi Bold", color: sub }));
    card.appendChild(text(plan.price, { size: 40, style: "Bold", color: fg }));
    plan.items.forEach((item) =>
      card.appendChild(text("-  " + item, { size: 14, color: sub, lineHeight: 22 }))
    );
    const btn = autoFrame("Choose", "HORIZONTAL", {
      padTop: 12,
      padBottom: 12,
      padLeft: 20,
      padRight: 20,
      radius: 10,
      fill: plan.highlight ? C.white : C.primary,
      align: "CENTER",
      cross: "CENTER",
      stretch: true,
    });
    btn.appendChild(text("Choose " + plan.name, { size: 14, style: "Semi Bold", color: plan.highlight ? C.primary : C.white }));
    card.appendChild(btn);
    row.appendChild(card);
  });
  f.appendChild(row);
  return f;
}

function webTestimonial() {
  const f = autoFrame("Testimonial", "VERTICAL", {
    pad: 80,
    spacing: 24,
    fill: C.surface,
    align: "CENTER",
    cross: "CENTER",
    stretch: true,
  });
  f.appendChild(paragraph("This plugin lets our team ship screens in minutes, not hours.", 720, { size: 24, style: "Medium", align: "CENTER", lineHeight: 34 }));

  const who = autoFrame("Author", "HORIZONTAL", { spacing: 12, cross: "CENTER" });
  who.appendChild(circle(44, C.primary, false));
  const meta = autoFrame("Meta", "VERTICAL", { spacing: 2 });
  meta.appendChild(text("Alex Morgan", { size: 15, style: "Semi Bold" }));
  meta.appendChild(text("Head of Design, Acme", { size: 13, color: C.muted }));
  who.appendChild(meta);
  f.appendChild(who);
  return f;
}

function webCta() {
  const f = autoFrame("CTA Banner", "HORIZONTAL", {
    pad: 48,
    spacing: 24,
    fill: C.dark,
    cross: "CENTER",
    stretch: true,
  });
  const col = autoFrame("Copy", "VERTICAL", { spacing: 8, grow: 1 });
  col.appendChild(text("Ready to build?", { size: 28, style: "Bold", color: C.white }));
  col.appendChild(text("Add your first section from the OpenCode panel.", { size: 15, color: C.slate }));
  f.appendChild(col);

  const btn = autoFrame("CTA", "HORIZONTAL", {
    padTop: 14,
    padBottom: 14,
    padLeft: 24,
    padRight: 24,
    radius: 10,
    fill: C.primary,
    align: "CENTER",
    cross: "CENTER",
  });
  btn.appendChild(text("Get started free", { size: 15, style: "Semi Bold", color: C.white }));
  f.appendChild(btn);
  return f;
}

function webFooter() {
  const f = autoFrame("Footer", "VERTICAL", {
    pad: 56,
    spacing: 32,
    fill: C.white,
    stroke: C.border,
    stretch: true,
  });

  const top = autoFrame("Columns", "HORIZONTAL", { spacing: 48, stretch: true });
  const brandCol = autoFrame("Brand", "VERTICAL", { spacing: 10, grow: 2 });
  brandCol.appendChild(text("OpenCode", { size: 20, style: "Bold" }));
  brandCol.appendChild(paragraph("Design systems and UI, generated straight onto your canvas.", 260, { size: 14, color: C.muted, lineHeight: 20 }));
  top.appendChild(brandCol);

  const cols = [
    ["Product", ["Features", "Pricing", "Changelog"]],
    ["Company", ["About", "Careers", "Contact"]],
    ["Legal", ["Privacy", "Terms"]],
  ];
  cols.forEach(([title, items]) => {
    const col = autoFrame(title, "VERTICAL", { spacing: 10, grow: 1 });
    col.appendChild(text(title, { size: 14, style: "Semi Bold" }));
    items.forEach((item) => col.appendChild(text(item, { size: 14, color: C.muted })));
    top.appendChild(col);
  });
  f.appendChild(top);

  const bottom = autoFrame("Bottom", "HORIZONTAL", { stretch: true });
  bottom.appendChild(text("(c) 2026 OpenCode. All rights reserved.", { size: 13, color: C.muted }));
  f.appendChild(bottom);
  return f;
}

const BUILDERS = {
  "mobile.statusBar": () => ["mobile", mobileStatusBar()],
  "mobile.topBar": () => ["mobile", mobileTopBar()],
  "mobile.searchBar": () => ["mobile", mobileSearchBar()],
  "mobile.hero": () => ["mobile", mobileHero()],
  "mobile.sectionTitle": () => ["mobile", mobileSectionTitle()],
  "mobile.card": () => ["mobile", mobileCard()],
  "mobile.listItem": () => ["mobile", mobileListItem()],
  "mobile.grid": () => ["mobile", mobileGrid()],
  "mobile.bottomNav": () => ["mobile", mobileBottomNav()],
  "mobile.fab": () => ["mobile", mobileFab()],
  "web.navbar": () => ["web", webNavbar()],
  "web.hero": () => ["web", webHero()],
  "web.logos": () => ["web", webLogoCloud()],
  "web.features": () => ["web", webFeatures()],
  "web.pricing": () => ["web", webPricing()],
  "web.testimonial": () => ["web", webTestimonial()],
  "web.cta": () => ["web", webCta()],
  "web.footer": () => ["web", webFooter()],
};

function getRoot(device) {
  const name = device === "mobile" ? "OpenCode - Mobile" : "OpenCode - Web";
  const existing = figma.currentPage.findOne(
    (n) => n.type === "FRAME" && n.name === name
  );
  if (existing) return existing;

  const root = figma.createFrame();
  root.name = name;
  root.layoutMode = "VERTICAL";
  root.itemSpacing = 0;
  root.paddingTop = 0;
  root.paddingRight = 0;
  root.paddingBottom = 0;
  root.paddingLeft = 0;
  root.fills = solid(C.bg);
  root.resize(device === "mobile" ? 390 : 1440, 200);
  root.primaryAxisSizingMode = "AUTO";
  root.counterAxisSizingMode = "FIXED";
  root.x = device === "mobile" ? 0 : 480;
  root.y = 0;
  root.setPluginData("opencodeRoot", "1");
  return root;
}

function createStyles() {
  const paints = [
    ["Brand/Primary", C.primary],
    ["Brand/Secondary", C.secondary],
    ["Brand/Accent", C.accent],
    ["Surface/Background", C.bg],
    ["Surface/Muted", C.surface],
    ["Surface/Alt", C.surfaceAlt],
    ["Text/Primary", C.text],
    ["Text/Muted", C.muted],
    ["Border/Default", C.border],
  ];
  paints.forEach(([name, hex]) => {
    const existing = figma.getLocalPaintStyles().find((s) => s.name === name);
    const style = existing || figma.createPaintStyle();
    style.name = name;
    style.paints = solid(hex);
  });

  const texts = [
    ["Display/H1", 48, "Bold"],
    ["Heading/H2", 32, "Bold"],
    ["Heading/H3", 20, "Semi Bold"],
    ["Body/Regular", 15, "Regular"],
    ["Body/Small", 13, "Regular"],
  ];
  texts.forEach(([name, size, fontStyle]) => {
    const existing = figma.getLocalTextStyles().find((s) => s.name === name);
    const style = existing || figma.createTextStyle();
    style.name = name;
    style.fontName = { family: FONT_FAMILY, style: fontStyle };
    style.fontSize = size;
  });
}

function clearGenerated() {
  const roots = figma.currentPage.findAll(
    (n) => n.getPluginData("opencodeRoot") === "1"
  );
  roots.forEach((n) => n.remove());
  return roots.length;
}

function notify(type, message) {
  figma.ui.postMessage({ type, message });
}

async function handleCreate(action) {
  await loadFonts();

  if (action === "system.styles") {
    createStyles();
    notify("done", "Color and text styles created");
    return;
  }

  if (action === "system.clear") {
    const removed = clearGenerated();
    notify("done", removed ? "Removed " + removed + " generated frame(s)" : "Nothing to clear");
    return;
  }

  const entry = BUILDERS[action];
  if (!entry) {
    notify("error", "Unknown action: " + action);
    return;
  }

  const result = entry();
  const device = result[0];
  const node = result[1];
  const root = getRoot(device);
  root.appendChild(node);
  figma.currentPage.selection = [node];
  figma.viewport.scrollAndZoomIntoView([node]);
  notify("done", "Added: " + node.name);
}

figma.showUI(__html__, { width: 360, height: 640, title: "OpenCode Builder" });

figma.ui.onmessage = async (msg) => {
  if (!msg || msg.type !== "create") return;
  try {
    await handleCreate(msg.action);
  } catch (err) {
    notify("error", err && err.message ? err.message : String(err));
  }
};
