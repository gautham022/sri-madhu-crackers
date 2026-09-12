#!/usr/bin/env python3
"""Copy product images to public/ (slugified) and build data/seed-products.json."""
import json, os, re, shutil, unicodedata

SRC = r"D:\sri madhu crackers\photo"
DST = r"D:\sri madhu crackers\public\products"
DATA = r"D:\sri madhu crackers\data"
os.makedirs(DST, exist_ok=True); os.makedirs(DATA, exist_ok=True)

def norm(s):
    s = s.replace("½","12").replace("¾","34").replace("¼","14").replace("&","and")
    s = unicodedata.normalize("NFKD", s)
    return re.sub(r"[^a-z0-9]", "", s.lower())

def slugify(s):
    s = s.replace("½","-half").replace("¾","-3q").replace("¼","-q")
    s = unicodedata.normalize("NFKD", s).encode("ascii","ignore").decode()
    s = re.sub(r"[^\w\s-]", "", s).strip().lower()
    return re.sub(r"[\s_-]+", "-", s)

# collect source files: {foldername: {norm(stem): relative path}}
tree = {}
for root, _, files in os.walk(SRC):
    for f in files:
        if not f.lower().endswith((".png",".jpg",".jpeg",".webp")): continue
        rel = os.path.relpath(os.path.join(root, f), SRC)
        folder = rel.split(os.sep)[0] if os.sep in rel else ""
        tree.setdefault(folder, {})[norm(os.path.splitext(f)[0])] = rel

# copy every image to public/products/<catslug>/<fileslug>.png
copied = {}
for folder, files in tree.items():
    if folder == "":  # root-level files (logo etc.)
        for n, rel in files.items():
            if "logo" in n:
                shutil.copy2(os.path.join(SRC, rel), os.path.join(r"D:\sri madhu crackers\public", "logo.png"))
        continue
    cat = slugify(folder)
    os.makedirs(os.path.join(DST, cat), exist_ok=True)
    for n, rel in files.items():
        stem, ext = os.path.splitext(os.path.basename(rel))
        dst = f"/products/{cat}/{slugify(stem)}{ext.lower()}"
        shutil.copy2(os.path.join(SRC, rel), os.path.join(r"D:\sri madhu crackers\public", dst.lstrip("/")))
        copied.setdefault(folder, {})[n] = dst

# category display order
CATS = {
 "sparklers":"Sparklers","flower pot":"Flower Pots","ground chakkers":"Ground Chakkers",
 "Twinkling":"Twinkling Stars","enjoy pencil":"Enjoy Pencil","one sound creacker":"One Sound Crackers",
 "rocket":"Rockets","bomb":"Bombs","giant crackers":"Giant Crackers",
 "garlands(classic)":"Garlands (Classic)","garlands (prime)":"Garlands (Prime)",
 "baby variety items":"Baby Variety Items","colour rider shots":"Colour Rider Shots",
 "multi-colour shot":"Multi Colour Shots","mini aerial shot":"Mini Aerial Fancy",
 "mega display":"Mega Display","2¼ COLOR FOUNTAIN":'2.25" Colour Fountains',
 "1¾ COLOR FOUNTAIN":'1.75" Colour Fountains',"MATCHES":"Matches","GUN & ROLL CAP":"Guns & Roll Caps",
 "ADIYAL PAPER BOMB":"Adiyal Paper Bombs","gift box":"Gift Boxes",
}
# products: (category_folder, display_name, price)  price None = price on request
P = [
 ("sparklers","7 Cm Electric Sparklers (10 pcs/box)",50),("sparklers","7 Cm Colour Sparklers (10 pcs/box)",60),
 ("sparklers","10 Cm Electric Sparklers (10 pcs/box)",110),("sparklers","10 Cm Colour Sparklers (10 pcs/box)",150),
 ("sparklers","12 Cm Electric Sparklers (10 pcs/box)",170),("sparklers","12 Cm Colour Sparklers (10 pcs/box)",180),
 ("sparklers","15 Cm Electric Sparklers (10 pcs/box)",270),("sparklers","15 Cm Colour Sparklers (10 pcs/box)",300),
 ("sparklers","30 Cm Electric Sparklers (5 pcs/box)",270),("sparklers","30 Cm Colour Sparklers (5 pcs/box)",300),
 ("sparklers","30 Cm Green Sparklers (5 pcs/box)",350),("sparklers","55 Cm Electric Sparklers (5 pcs/box)",1600),
 ("sparklers","55 Cm Colour Sparklers (5 pcs/box)",1700),
 ("flower pot","Flower Pots Big (10 pcs/box)",500),("flower pot","Flower Pots Special (10 pcs/box)",650),
 ("flower pot","Flower Pots Ashoks (10 pcs/box)",850),("flower pot","Flower Pots Deluxe (5 pcs/box)",900),
 ("flower pot","Power Koti (5 pcs/box)",900),("flower pot","Colour Koti (10 pcs/box)",1800),
 ("flower pot","Gold Coin Fountain (5 pcs/box)",1000),("flower pot","Tri Colour Fountains (5 pcs/box)",2200),
 ("ground chakkers","Ground Chakkar Big (10 pcs)",380),("ground chakkers","Ground Chakkar Special (10 pcs)",650),
 ("ground chakkers","Ground Chakkar Deluxe (10 pcs)",1100),("ground chakkers","Disco Wheel (5 pcs/box)",350),
 ("ground chakkers","Disco Wheel (10 pcs/box)",700),
 ("Twinkling",'1.5" Twinkling Star (10 pcs/box)',160),("Twinkling",'4" Twinkling Star (10 pcs/box)',550),
 ("enjoy pencil","Photo Flash Pencil (3 pcs/box)",350),("enjoy pencil","Ultra Candie (3 pcs/box)",650),
 ("enjoy pencil","Magic Feather (3 pcs/box)",650),
 ("one sound creacker",'2.75" Kuruvi Vedi (5 pcs/pkt)',60),("one sound creacker",'4" Lakshmi Vedi (5 pcs/pkt)',180),
 ("one sound creacker",'6" Jalli Kattu (5 pcs/pkt)',350),
 ("baby variety items","Red Bijili (100 pcs/bag)",170),
 ("rocket","Bomb Rocket (10 pcs/box)",650),("rocket","Lunik Rocket (10 pcs/box)",1300),
 ("rocket","Whistling Rocket (10 pcs/box)",1800),
 ("bomb","Hydro Bomb (10 pcs/box)",800),("bomb","King of King Bomb (10 pcs/box)",1000),
 ("bomb","Classic Bomb (10 pcs/box)",1100),("bomb","555 Bomb (10 pcs/box)",1300),
 ("giant crackers","28 Giant Crackers (1 pc/pkt)",160),("giant crackers","56 Giant Crackers (1 pc/pkt)",320),
 ("giant crackers","24 Deluxe Crackers (1 pc/pkt)",480),
 ("garlands(classic)","1000 Wala Garland (Classic)",1400),("garlands(classic)","2000 Wala Garland (Classic)",2500),
 ("garlands (prime)","100 Wala Garland (Prime)",350),("garlands (prime)","200 Wala Garland (Prime)",700),
 ("garlands (prime)","1000 Wala Garland (Prime)",1700),("garlands (prime)","2000 Wala Garland (Prime)",3300),
 ("garlands (prime)","5000 Wala Garland (Prime)",8000),("garlands (prime)","10000 Wala Garland (Prime)",14000),
 ("baby variety items",'4" Beer Blue Fountain Tin (1 pc)',700),("baby variety items",'4" Beer Green Fountain Tin (1 pc)',700),
 ("baby variety items",'4" Beer Red Fountain Tin (1 pc)',700),("baby variety items",'4.5" Amazing Falls Tin (1 pc)',800),
 ("baby variety items",'4.5" Miracle Fountain Tin (1 pc)',800),("baby variety items",'6" Happy Happy Fountain Tin',900),
 ("baby variety items",'6" Popcorn Fountain Tin (1 pc)',900),("baby variety items","4X4 Wheel (5 pcs/box)",1400),
 ("baby variety items","Peacock Fountain (1 pc)",1400),("baby variety items","Black Money (1 pc/box)",250),
 ("baby variety items",'Chocolate Water Queen (1 pc)',250),("baby variety items","Velum Mayilum (1 pc)",700),
 ("baby variety items","Cricket Bat (1 pc)",700),("baby variety items","Butterfly Colour Chakri (10 pcs/box)",800),
 ("baby variety items","Drone (5 pcs/box)",800),("baby variety items","Helicopter (5 pcs/box)",800),
 ("baby variety items","Corona (1 pc)",800),("baby variety items","5G Net Work (1 pc)",800),
 ("baby variety items","Peacock 3 Colour (1 pc/box)",1500),("baby variety items","Photo Flash (5 pcs/box)",350),
 ("baby variety items","Water Queen (1 pc/tin)",800),("baby variety items","Magic Show (1 pc)",1000),
 ("baby variety items","Colour Smoke (3 pcs/box)",1000),("baby variety items","Lollipop Crackers (5 pcs/box)",1500),
 ("baby variety items","Mega Siren (3 pcs/box)",1900),
 ("colour rider shots","12 Shot Colour Rider (1 pc)",1200),("colour rider shots","25 Shot Colour Rider (1 pc)",2800),
 ("colour rider shots","50 Shot Colour Rider (1 pc)",5500),
 ("multi-colour shot","30 Shot Multi Colour",2800),("multi-colour shot","60 Shot Multi Colour",5600),
 ("multi-colour shot","120 Shot Multi Colour",11000),("multi-colour shot","30 Shot Multi Colour (Offer)",4000),
 ("multi-colour shot","60 Shot Multi Colour (Brand)",8000),("multi-colour shot","120 Shot Multi Colour (Brand)",16000),
 ("mini aerial shot","Sky Shot (1 pc)",100),("mini aerial shot","7 Shot Colour (5 pcs/box)",1400),
 ("mini aerial shot","Nemo Shot (5 pcs/box)",850),("mini aerial shot","Sky King (5 pcs/box)",850),
 ("mega display",'2" Aerial Fancy (1 pc)',700),("mega display",'2" Aerial Fancy Green (1 pc)',700),
 ("mega display",'2" Aerial Fancy Red (1 pc)',700),("mega display",'2" Aerial Fancy White (1 pc)',700),
 ("mega display",'2" Aerial Fancy (3 pcs)',2300),("mega display",'3.5" Fancy - 6 Designs (1 pc)',2000),
 ("mega display",'4" Fancy - 6 Designs (1 pc)',2500),("mega display",'5" Fancy - 6 Designs (1 pc)',3000),
 ("2¼ COLOR FOUNTAIN","Tom Jerry Gold (1 pc/box)",150),("2¼ COLOR FOUNTAIN","Tom Jerry Green (1 pc/box)",150),
 ("2¼ COLOR FOUNTAIN","Tom Jerry Red (1 pc/box)",150),("2¼ COLOR FOUNTAIN","Tom Jerry Silver (1 pc/box)",150),
 ("1¾ COLOR FOUNTAIN","Oreo Gold (5 pcs/box)",750),("1¾ COLOR FOUNTAIN","Oreo Green (5 pcs/box)",750),
 ("1¾ COLOR FOUNTAIN","Oreo Red (5 pcs/box)",750),("1¾ COLOR FOUNTAIN","Oreo Red & Green (5 pcs/box)",750),
 ("1¾ COLOR FOUNTAIN","Oreo Silver (5 pcs/box)",750),
 ("MATCHES","3D 3-in-1 (3 pcs/box)",350),("MATCHES","Dora Matches (3 pcs/box)",700),
 ("MATCHES","Mega Size Laptop (10 pcs/box)",1400),
 ("GUN & ROLL CAP","Roll Cap (100 pcs/box)",900),("GUN & ROLL CAP","Gun Special (1 pc)",350),
 ("GUN & ROLL CAP","Gun Deluxe (1 pc)",1200),("GUN & ROLL CAP","Gun Super Deluxe (1 pc)",2000),
 ("ADIYAL PAPER BOMB","Adiyal Paper Bomb (Small)",380),("ADIYAL PAPER BOMB","Adiyal Paper Bomb (1/2 kg)",750),
 ("ADIYAL PAPER BOMB","Adiyal Paper Bomb (1 kg)",1450),
 ("gift box","25 Items Gift Box",None),("gift box","35 Items Gift Box",None),
 ("gift box","50 Items Gift Box",None),("gift box","60 Items Gift Box",None),
 ("gift box","70 Items Gift Box",None),
]

# explicit overrides for spelling variants between PDF names and image filenames
OVERRIDE = {
 "7 Cm Colour Sparklers (10 pcs/box)":"/products/sparklers/7-cm-color-10pcsbox.png",
 "10 Cm Colour Sparklers (10 pcs/box)":"/products/sparklers/10-cm-color-10-pcsbox.png",
 "12 Cm Colour Sparklers (10 pcs/box)":"/products/sparklers/12-cm-color-10pcs-box.png",
 "15 Cm Colour Sparklers (10 pcs/box)":"/products/sparklers/15-cm-color-10pcsbox.png",
 "30 Cm Colour Sparklers (5 pcs/box)":"/products/sparklers/30-cm-color-5pcsbox.png",
 "30 Cm Green Sparklers (5 pcs/box)":"/products/sparklers/30-cm-green-5pcsbox.png",
 "55 Cm Colour Sparklers (5 pcs/box)":"/products/sparklers/55-cm-color-5pcsbox.png",
 "Disco Wheel (5 pcs/box)":"/products/ground-chakkers/dlsco-wheel-5-pcs-box.png",
 "Disco Wheel (10 pcs/box)":"/products/ground-chakkers/dlsco-wheel-10-pcs-box.png",
 '1.5" Twinkling Star (10 pcs/box)':"/products/twinkling/112twinkling-star-10-pcs-box.png",
 '2.75" Kuruvi Vedi (5 pcs/pkt)':"/products/one-sound-creacker/2-3q-kuruvi-vedi-brand-5-pcspkt.png",
 '4" Lakshmi Vedi (5 pcs/pkt)':"/products/one-sound-creacker/4-laxmi-vedi-5-pcspkt.png",
 "Red Bijili (100 pcs/bag)":"/products/red-bijili-100pcsbog.png",
 "1000 Wala Garland (Classic)":"/products/garlands-classic/1000-wala-classic.png",
 "2000 Wala Garland (Classic)":"/products/garlands-classic/2000-wala-classic.png",
 "100 Wala Garland (Prime)":"/products/garlands-prime/100-wala-prime.png",
 "200 Wala Garland (Prime)":"/products/garlands-prime/200-wala-prime.png",
 "1000 Wala Garland (Prime)":"/products/garlands-prime/1000-wala-prime.png",
 "2000 Wala Garland (Prime)":"/products/garlands-prime/2000-walaprime.png",
 "5000 Wala Garland (Prime)":"/products/garlands-prime/5000-walaprime.png",
 "10000 Wala Garland (Prime)":"/products/garlands-prime/10000-walaprime.png",
 '4.5" Amazing Falls Tin (1 pc)':"/products/baby-variety-items/41-2-amazing-falls-tin-1pcs.png",
 '4.5" Miracle Fountain Tin (1 pc)':"/products/baby-variety-items/41-2-miracle-fountain-tin-1pcs.png",
 "Magic Show (1 pc)":"/products/magic-show-1pcs.png",
 "7 Shot Colour (5 pcs/box)":"/products/mini-aerial-shot/7-shot-color-5pcsbox.png",
 "Nemo Shot (5 pcs/box)":"/products/mini-aerial-shot/nemo-shat-5pcsbox.png",
 "Mega Size Laptop (10 pcs/box)":"/products/matches/megha-size-loptop-10pcsbox.png",
 "Gun Super Deluxe (1 pc)":"/products/gun-roll-cap/gun-super-deluxe-1pcs.png",
}

def find_img(folder, name):
    if name in OVERRIDE: return OVERRIDE[name]
    cands = copied.get(folder, {})
    n = norm(name)
    if n in cands: return cands[n]
    for k, v in cands.items():
        if k.startswith(n) or n.startswith(k) or (len(n)>8 and (n[:10] in k or k[:10] in n)): return v
    return None

products, missing = [], []
for folder, name, price in P:
    img = find_img(folder, name)
    if not img: missing.append((folder, name))
    products.append({"id": slugify(name), "name": name, "category": CATS[folder], "price": price, "image": img or "/logo.png"})

with open(os.path.join(DATA, "seed-products.json"), "w", encoding="utf-8") as f:
    json.dump(products, f, ensure_ascii=False, indent=1)

print(f"products: {len(products)}, missing images: {len(missing)}")
for m in missing: print("MISSING:", m)
