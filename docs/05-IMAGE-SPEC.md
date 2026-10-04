# Product Image Specification

| Item | Requirement |
|---|---|
| Master size | 1600 × 1600 px square (Google minimum 500 × 500, enforced from 31 Jan 2027; recommended 1500 × 1500 or more) |
| Limits | ≤ 64 MP and ≤ 16 MB per image |
| Background | White or very light neutral; product fills about 75–90 % of the frame |
| Forbidden | Watermarks, promo text, badges, "free shipping" overlays, collages, placeholders, upscaled or thumbnail images |
| Images per product | Minimum 3 (front, back / nutrition label, in-use or size reference) + 1 lifestyle |
| Formats | Site: AVIF/WebP via `next/image`. Feed: JPG or PNG original |
| File name | `brand-product-flavour-size.webp` (lowercase, hyphens) |
| Alt text | Factual French description: "Pot de créatine monohydrate Applied Nutrition 250 g" |
| URLs | Stable; no timestamps or changing parameters |
| Crawlability | `robots.txt` allows Googlebot and Googlebot-Image |
| Video (optional) | Merchant Center `video_link` for in-use videos |

Variation images: one clear image per flavour/size variation. The Image Agent flags non-square, too-small, low-contrast or text-overlay images.
