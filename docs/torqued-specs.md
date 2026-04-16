# Torqued — Design Specs & Token System
## veloxlab.co/torqued · 2026

---

## 1. Brand

**Name** : TORQUED.
**Tagline** : Pan-European Auto Parts
**Domain** : torqued.veloxlab.co
**Mood** : Premium sobre — confiance, précision, européen

---

## 2. Typography

| Role | Font | Weight | Size | Letter-spacing | Line-height |
|---|---|---|---|---|---|
| Display | DM Sans | 600 | 48–52px | −0.04em | 1.05 |
| Heading | DM Sans | 500 | 24–32px | −0.02em | 1.2 |
| Body | DM Sans | 400 | 14px | 0 | 1.6 |
| UI / Label | DM Sans | 500 | 12–13px | −0.01em | 1.4 |
| Mono / Ref | DM Mono | 400–500 | 10–12px | 0.04em | 1.4 |

**Google Fonts import :**
```
https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap
```

---

## 3. Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--coral` | `#E8412A` | Accent principal, CTA, IAM badge |
| `--coral-bg` | `#FDECEA` | Background badge IAM, highlights |
| `--blue-oem` | `#0C3D6B` | Badge OEM text |
| `--blue-oem-bg` | `#E0EAF5` | Badge OEM background |
| `--blue-oes` | `#1565A8` | Badge OES text |
| `--blue-oes-bg` | `#DDEEFF` | Badge OES background |
| `--green-cert` | `#0A6640` | Badge CERTIFIED text |
| `--green-cert-bg` | `#D6F5E8` | Badge CERTIFIED background |
| `--grey-used` | `#4A5568` | Badge USED text |
| `--grey-used-bg` | `#ECEEF1` | Badge USED background |
| `--ink` | `#0F1923` | Texte principal, titres |
| `--ink-mid` | `#3D4A55` | Texte secondaire corps |
| `--ink-light` | `#6B7280` | Texte tertiaire, labels |
| `--bg` | `#FFFFFF` | Surface principale |
| `--bg-warm` | `#F7F7F5` | Background page |
| `--bg-warm2` | `#F0EFEC` | Surface secondaire |
| `--border` | `rgba(15,25,35,0.08)` | Bordures légères |
| `--border-mid` | `rgba(15,25,35,0.14)` | Bordures standard |
| `--success` | `#1D9E75` | Livraison gratuite, stock OK |

**Dark mode** (media query `prefers-color-scheme: dark`) :

| Token | Hex dark |
|---|---|
| `--ink` | `#F1F5F9` |
| `--ink-mid` | `#94A3B8` |
| `--ink-light` | `#64748B` |
| `--bg` | `#0F1923` |
| `--bg-warm` | `#131E2A` |
| `--bg-warm2` | `#1A2736` |
| `--border` | `rgba(255,255,255,0.06)` |
| `--border-mid` | `rgba(255,255,255,0.12)` |

---

## 4. Badge System

### Logique
- **Neuf** → badge type : OEM / OES / IAM
- **Occasion** → badge type : CERTIFIED / USED
- Toujours affiché en premier sur la carte produit
- Toujours accompagné d'un dot coloré pour lisibilité

### Structure HTML
```html
<span class="badge badge-oem">OEM</span>
<span class="badge badge-oes">OES</span>
<span class="badge badge-iam">IAM</span>
<span class="badge badge-certified">CERTIFIED</span>
<span class="badge badge-used">USED</span>
```

---

## 5. Spacing & Radius

| Token | Value |
|---|---|
| `--radius-sm` | `6px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `12px` |
| `--radius-xl` | `16px` |
| `--radius-full` | `999px` |

**Spacing scale** (base 4px) : 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64

---

## 6. Logo

- **Wordmark** : `TORQUED.` — DM Sans 600, letter-spacing −0.03em
- Le point final `.` est en `--coral`
- **Icône** : cercle cible avec dot corail central + axes cardinaux (SVG fourni ci-dessous)
- **Tagline** : `PAN-EUROPEAN AUTO PARTS` — DM Mono 400, 10px, letter-spacing 0.14em

```svg
<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2"/>
  <circle cx="24" cy="24" r="8" fill="#E8412A"/>
  <line x1="24" y1="4" x2="24" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <line x1="24" y1="36" x2="24" y2="44" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <line x1="4" y1="24" x2="12" y2="24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <line x1="36" y1="24" x2="44" y2="24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <line x1="9.4" y1="9.4" x2="15.3" y2="15.3" stroke="#E8412A" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="32.7" y1="32.7" x2="38.6" y2="38.6" stroke="#E8412A" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

---

## 7. Notes UI

- **Cartes produit** : border `0.5px`, hover → `border-color: var(--coral)`
- **Bouton primaire** : background `--coral`, hover → `opacity: 0.88`
- **Références produit** : toujours en `DM Mono`, couleur `--coral` sur fond `--coral-bg`
- **Prix** : DM Sans 600, letter-spacing −0.02em
- **Drapeaux pays** : emoji natif, toujours accompagné du nom de ville
