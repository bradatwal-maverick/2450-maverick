#!/usr/bin/env python3
"""Build the regional-Australia lookup: postcode -> main council, sub-postcodes, federal division, state seat, reps.
Inputs: postcode localities (matthewproctor), AEC locality->division (AustralianElectorates), ABS LGA 2023 + SED polygons,
regional WA/SA/NT seat map, and the fact-checked research files. Output: au-data.json for the Worker."""
import csv, json, re, collections, sys

D = "/home/claude/data"; B = "/home/claude/build"
STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT"]
reg = json.load(open(f"{B}/regional_postcodes.json"))
R = {s: json.load(open(f"{B}/research/{s}.json")) for s in STATES}
FED = json.load(open(f"{B}/research/federal.json"))
SEDX = json.load(open(f"{B}/research/sed_map_regional.json"))

def norm(s): return re.sub(r"[^a-z0-9]", "", s.lower().replace("&", "and"))

# ---------- geometry: plain-Python point in polygon with bbox prefilter ----------
def load_polys(path):
    out = []
    for f in json.load(open(path))["features"]:
        g = f["geometry"]; polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        xs = [p[0] for poly in polys for p in poly[0]]; ys = [p[1] for poly in polys for p in poly[0]]
        out.append((f["properties"], polys, (min(xs), min(ys), max(xs), max(ys))))
    return out
def ring_in(x, y, ring):
    c = False; j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i][:2]; xj, yj = ring[j][:2]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi: c = not c
        j = i
    return c
def hit(layer, x, y, state):
    for props, polys, (a, b, c, d) in layer:
        if props["state"] != state or not (a <= x <= c and b <= y <= d): continue
        for poly in polys:
            if ring_in(x, y, poly[0]) and not any(ring_in(x, y, h) for h in poly[1:]): return props["name"]
    return None
LGA = load_polys(f"{D}/boundaries/lga.geojson"); SED = load_polys(f"{D}/boundaries/sed.geojson")

# ---------- localities ----------
rows = [x for x in csv.DictReader(open(f"{D}/australianpostcodes/australian_postcodes.csv", encoding="utf-8-sig")) if x["type"] == "Delivery Area"]
loc = collections.defaultdict(list)
for x in rows:
    if x["state"] in reg and x["postcode"] in reg[x["state"]]: loc[(x["state"], x["postcode"])].append(x)

# AEC locality -> federal division (2025 boundaries)
aec = collections.defaultdict(set)
for z in json.load(open(f"{D}/AustralianElectorates/Data/Localities.json", encoding="utf-8-sig")):
    aec[(str(z["Postcode"]).zfill(4), norm(z["Place"]))].add(z["Electorate"].title())
aec_pc = collections.defaultdict(set)
for (p, _), v in aec.items(): aec_pc[p] |= v
divs = {h["division"]: h for h in FED["house"]}
divnorm = {norm(k): k for k in divs}

# ---------- councils: ABS name -> research entry ----------
def council_index(s):
    idx = {}
    for c in R[s]["councils"]:
        for n in [c["name"]] + c.get("old_names", []) + c.get("also_known_as", []) if isinstance(c.get("also_known_as", []), list) else [c["name"]] + c.get("old_names", []):
            idx[norm(n)] = c
    return idx
CI = {s: council_index(s) for s in STATES}
STRIP = re.compile(r"^(city|shire|town|municipality|district|regional council|council|borough|rural city|of|the)+|(cityof|shireof|townof|councilof)", re.I)
def find_council(s, abs_name):
    n = norm(abs_name)
    if n in CI[s]: return CI[s][n]
    for c in R[s]["councils"]:
        cn = norm(re.sub(r"\b(City|Shire|Town|Municipal|Municipality|Regional|Council|Rural|Borough|District|Aboriginal|Community|Government|of|the)\b", "", c["name"]))
        if cn == norm(re.sub(r"\(.*?\)", "", abs_name)): return c
    return None

def slug(s): return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")

pcs = {s: {} for s in STATES}; councils = {}; miss = collections.Counter(); unmatched_council = set()
for (s, p), xs in sorted(loc.items()):
    lgas = collections.Counter(); seds = collections.Counter(); feds = collections.Counter(); names = []
    dcs = collections.Counter(norm(re.sub(r"\b(DC|LPO|PO|MC|BC)\b.*$", "", x["dc"], flags=re.I)) for x in xs if x["dc"])
    def weight(x):
        n = norm(x["locality"])
        if dcs and n == dcs.most_common(1)[0][0]: return 25
        if n in dcs: return 10
        return 1
    pts = [(float(x["Lat_precise"] or x["lat"]), float(x["Long_precise"] or x["long"])) for x in xs if (x["Lat_precise"] or x["lat"])]
    mla = sorted(a for a, _ in pts)[len(pts) // 2] if pts else 0; mlo = sorted(b for _, b in pts)[len(pts) // 2] if pts else 0
    dist = lambda a, b: ((a - mla) ** 2 + ((b - mlo) * 0.87) ** 2) ** 0.5 * 111
    md = sorted(dist(a, b) for a, b in pts)[len(pts) // 2] if pts else 0
    for x in xs:
        w = weight(x)
        try:
            if len(pts) >= 3 and dist(float(x["Lat_precise"] or x["lat"]), float(x["Long_precise"] or x["long"])) > max(50, 4 * md): miss["outlier"] += 1; continue
        except ValueError: pass
        try: lat = float(x["Lat_precise"] or x["lat"]); lon = float(x["Long_precise"] or x["long"])
        except ValueError: lat = lon = None
        if not re.search(r"\b(DC|LPO|MC|BC|PLAZA|MAIL CENTRE|DELIVERY CENTRE|PO)$", x["locality"], re.I): names.append(x["locality"].title())
        if lat is not None:
            l = hit(LGA, lon, lat, s)
            if l: lgas[l] += w
            else: miss["lga"] += 1
        # federal: AEC locality list (authoritative); fall back to whole-postcode list
        f = aec.get((p, norm(x["locality"])))
        for d in (f or []): feds[d] += w
        # state seat
        if s in ("WA", "SA", "NT"):
            for d in SEDX.get(s, {}).get(p, {}).get(x["locality"].upper(), []): seds[d] += w
        elif lat is not None:
            d = hit(SED, lon, lat, s)
            if d: seds[d] += w
            else: miss["sed"] += 1
    if not feds:
        for d in aec_pc.get(p, []): feds[d] += 1
    if not lgas: miss["no_council"] += 1; continue
    def keep(c):  # drop stray secondaries (usually one badly geocoded locality)
        t = sum(c.values()); top = c.most_common(1)[0][0]
        for k in list(c):
            if k != top and c[k] / t < 0.02: del c[k]
    keep(lgas)
    order = [n for n, _ in lgas.most_common() if not n.lower().startswith("unincorporated")] or [n for n, _ in lgas.most_common()]
    main = order[0]
    entries = []
    for n in order:
        c = find_council(s, n)
        if not c: unmatched_council.add((s, n))
        key = f"{s.lower()}/{slug(c['name'] if c else n)}"
        if key not in councils:
            councils[key] = {"name": c["name"] if c else n, "state": s, "web": c.get("website", "") if c else "", "src": c.get("source", "") if c else "", "pcs": []}
        entries.append(key)
    councils[entries[0]]["pcs"].append(p)
    fedl = [divnorm.get(norm(d), d) for d, _ in feds.most_common()]
    pcs[s][p] = {"c": entries[0], "also": entries[1:], "loc": sorted(set(names)), "fed": fedl, "sed": [d for d, _ in seds.most_common()]}

# ---------- clean-up ----------
METRO = {"wa/city-of-armadale", "tas/city-of-hobart"}  # capital-city councils that slipped through the regional filter
for s in STATES:
    for p in [p for p, v in pcs[s].items() if v["c"] in METRO]:
        councils[pcs[s][p]["c"]]["pcs"].remove(p); del pcs[s][p]
for k in [k for k, c in councils.items() if not c["pcs"] and not any(k in v["also"] for s in STATES for v in pcs[s].values())]: del councils[k]
for k, c in councils.items():
    if c["name"].lower().startswith("unincorporated"): c["name"] = f"No local council (unincorporated {c['state']})"; c["uninc"] = True
    if c["name"] == "Weipa": c["name"] = "Weipa Town Authority"
# a few tiny places (islands, colleges) have no AEC locality entry: borrow their council's divisions and flag them
for s in STATES:
    for p, v in pcs[s].items():
        if not v["fed"]:
            pool = collections.Counter(d for q in councils[v["c"]]["pcs"] for d in pcs[s].get(q, {}).get("fed", []))
            v["fed"] = [d for d, _ in pool.most_common()]; v["chk"] = 1

# ---------- reps ----------
out_states = {}
for s in STATES:
    r = R[s]
    seats = {m["electorate"]: {"m": [[x["name"], x["party"]] for x in m["members"]], "src": (m["members"][0].get("source") if m["members"] else ""), "ok": m.get("verified", True), "note": m.get("note", "")} for m in r["members"]}
    out_states[s] = {"hog": r["head_of_government"], "house": r.get("lower_house", "Legislative Assembly"), "next": r.get("next_election", ""),
                     "lookup": r.get("electorate_lookup_url", ""), "seats": seats,
                     "senate": [[x["name"], x["party"]] for x in FED["senate"][s]], "senate_src": "https://www.aph.gov.au/senate/los"}
fed = {k: {"m": v["member"], "p": v["party"], "src": v["source"], "ok": v.get("verified", True)} for k, v in divs.items()}

# sanity: every referenced seat/division exists
bad = collections.Counter()
for s in STATES:
    for p, v in pcs[s].items():
        for d in v["fed"]:
            if d not in fed: bad[("fed", d)] += 1
        for d in v["sed"]:
            if d not in out_states[s]["seats"]: bad[(s, d)] += 1
        if not v["sed"]: bad[(s, "NO SEAT")] += 1
        if not v["fed"]: bad[(s, "NO DIVISION")] += 1
data = {"as_of": "2026-10-17", "pm": FED["prime_minister"], "aec_lookup": FED.get("lookup_url", "https://electorate.aec.gov.au/"),
        "fed": fed, "states": out_states, "councils": councils, "pcs": pcs}
json.dump(data, open(f"{B}/au-data.json", "w"), separators=(",", ":"))
print("postcodes", {s: len(pcs[s]) for s in STATES}, "councils", len(councils))
print("misses", dict(miss)); print("unmatched councils", sorted(unmatched_council)); print("bad refs", bad.most_common(40))
