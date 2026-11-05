# AstraCoreNova — бізнес-сайт

Незалежний сайт цифрових працівників для бізнесу. Домен: **https://astracorenova.com/**. Пошта: **contact@astracorenova.com**.

Статичний HTML, UA/EN, єдина кінематографічна сцена храму, three.js 0.180.0, GSAP 3.13.0, стиснені GLB/WebP. Мобільні й слабкі пристрої використовують постери. Поява текстових блоків і карток поважає reduced motion.

## Локальний перегляд

```powershell
python -m http.server 4180 --bind 127.0.0.1
```

Відкрити http://127.0.0.1:4180/.

```powershell
python scripts/build-home.py
python scripts/check-business.py
node scripts/check-models.mjs
node scripts/check-architecture-models.mjs
```

## Публікація

Власник переглянув локальний сайт та дозволив публікацію 2026-11-05. Налаштування:

1. Перший push у `main`.
2. Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
3. Custom domain: `astracorenova.com`; кореневий `CNAME` уже підготовлений.
4. Перевірити DNS у власника домену та доступність HTTPS; увімкнути Enforce HTTPS після видачі сертифіката.

Наявність локального CNAME сама по собі не активує домен у GitHub Pages. Документація: [publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
