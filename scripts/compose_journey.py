"""Compose the approved continuous temple around the existing static business content."""
import re

def compose(html):
    html=html.replace('<script src="assets/js/site.js" defer></script>','<script src="assets/js/site.js" defer></script><script src="assets/js/reveal.js" defer></script>')
    html=html.replace('<body>','<body class="temple-site">',1)
    html=html.replace('<link rel="stylesheet" href="assets/css/temple.css">','<link rel="stylesheet" href="assets/css/temple.css"><link rel="stylesheet" href="assets/css/journey-site.css">')
    html=html.replace('href="assets/brand/temple.webp"','href="assets/3d/oracle-poster.webp"',1)
    html=html.replace('<link rel="preload" as="image" href="assets/3d/oracle-poster.webp">','<link rel="preload" as="image" href="assets/3d/oracle-poster.webp" media="(min-width:901px)"><link rel="preload" as="font" type="font/woff2" href="assets/fonts/cormorant-cyrillic.woff2" crossorigin><link rel="preload" as="font" type="font/woff2" href="assets/fonts/inter-cyrillic.woff2" crossorigin>')
    html=html.replace(' aria-label="AstraCoreNova — головна"','')
    html=html.replace('"logo":"https://astracorenova.com/logo.png"','"logo":"https://astracorenova.com/assets/brand/acn-winged-a-gold-512.webp"')
    html=html.replace('<header class="site-header">','<div id="temple-scene" aria-hidden="true"></div><div class="temple-vignette" aria-hidden="true"></div><header class="site-header">',1)
    html=html.replace('<div class="temple-backdrop" aria-hidden="true"></div>','')
    html=html.replace('<canvas class="code-canvas" aria-hidden="true"></canvas>','')
    html=html.replace('<div class="difference-grid">','<h2 class="sr-only" data-en="Our approach">Наш підхід</h2><div class="difference-grid">',1)
    html=html.replace('<div class="studio-emblem" aria-hidden="true"><span>✧</span><p>ASTRA<br>CORE<br>NOVA</p><small>ARS × INTELLIGENTIA</small></div>','<div class="studio-emblem" aria-hidden="true"><img src="assets/brand/acn-winged-a-gold-512.webp" alt="" width="240" height="240" loading="lazy"><small>ARS × INTELLIGENTIA</small></div>')
    map_html='<nav class="room-nav" aria-label="Зали храму / Temple rooms">'
    for number,ident,uk,en in [('01','hero','Вхід','Entrance'),('02','services','Послуги','Services'),('03','process','Як працюємо','Process'),('04','security','Безпека','Security'),('05','pricing','Тарифи','Pricing')]:
        map_html+=f'<a href="#{ident}" data-room-link="{ident}"><span>{number}</span><i aria-hidden="true"></i><span class="room-name" data-en="{en}">{uk}</span></a>'
    map_html+='</nav><a class="button persistent-contact" href="mailto:contact@astracorenova.com?subject=%D0%A6%D0%B8%D1%84%D1%80%D0%BE%D0%B2%D0%B8%D0%B9%20%D0%BF%D1%80%D0%B0%D1%86%D1%96%D0%B2%D0%BD%D0%B8%D0%BA%20%D0%B4%D0%BB%D1%8F%20%D0%B1%D1%96%D0%B7%D0%BD%D0%B5%D1%81%D1%83"><span data-en="Discuss my business">Обговорити мій бізнес</span><span aria-hidden="true">↗</span></a>'
    html=html.replace('<main id="main">',map_html+'<main id="main">',1)
    # Model containers remain lightweight accessible poster fallbacks; WebGL is always global.
    html=re.sub(r'<div class="model-mount"></div>','',html)
    return html
