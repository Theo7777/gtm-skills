# Apify actor: facebook-ads-library-scraper

**Actor ID:** `XtaWFhbtfxyzqrFmd` (curious_coder/facebook-ads-library-scraper)
**Cost:** about $0.75 per 1,000 results
**Token:** read from the `APIFY_TOKEN` environment variable. Never stored in the script.

## Input the script sends

The actor takes URLs, not search terms. Keyword mode builds a Meta Ad Library search URL. Advertiser mode passes a Facebook page URL.

Keyword mode:

```json
{
  "urls": [{"url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=GB&q=meal+kit+delivery&search_type=keyword_unordered"}],
  "count": 20,
  "scrapeAdDetails": true,
  "scrapePageAds.activeStatus": "active",
  "scrapePageAds.countryCode": "GB",
  "scrapePageAds.sortBy": "impressions_desc",
  "scrapePageAds.period": ""
}
```

Advertiser mode:

```json
{
  "urls": [{"url": "https://www.facebook.com/nike"}],
  "count": 20,
  "scrapeAdDetails": true,
  "scrapePageAds.activeStatus": "all",
  "scrapePageAds.countryCode": "GB",
  "scrapePageAds.sortBy": "impressions_desc",
  "scrapePageAds.period": ""
}
```

`count` is never sent below 10 because the actor ignores smaller values. `scrapePageAds.countryCode` is the `--country` flag in both modes; pass `ALL` to see every market.

## Output fields the script reads (per ad)

| Field | Path | Notes |
|-------|------|-------|
| Ad ID | `ad_archive_id` | Used to build the Ad Library link |
| Page name | `snapshot.page_name` | Advertiser name |
| Page URL | `snapshot.page_profile_uri` | Link to the Facebook page |
| Start date | `startDate`, `start_date`, or `ad_delivery_start_time` | Unix timestamp or ISO string |
| Ad body | `snapshot.body.text`, falling back to `snapshot.caption` | Primary text |
| CTA | `snapshot.cta_text` | For example "Learn More", "Shop Now" |
| Video | `snapshot.videos[].video_hd_url` or `video_sd_url` | Most common location |
| Video (fallback) | `snapshot.video_hd_url`, `snapshot.video_sd_url`, `snapshot.watermarked_video_hd_url` | Older result shapes |
| Video (carousel) | `snapshot.cards[].video_hd_url` or `video_sd_url` | One video per card |

Ads with no video URL in any of those places are dropped. Image and text-only ads are out of scope.

## Sorting rule

Oldest start date first. An advertiser only keeps paying for an ad that is making money, so the ads that have run longest are the strongest signal in the set. It is a proxy, not proof: a large brand can afford to run a weak ad for months.

## Calling the actor directly

```bash
# Start a run
curl -X POST "https://api.apify.com/v2/acts/XtaWFhbtfxyzqrFmd/runs?token=$APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"urls":[{"url":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=GB&q=meal+kit+delivery&search_type=keyword_unordered"}],"count":20,"scrapeAdDetails":true}'

# Poll status
curl "https://api.apify.com/v2/actor-runs/<RUN_ID>?token=$APIFY_TOKEN"

# Fetch results
curl "https://api.apify.com/v2/actor-runs/<RUN_ID>/dataset/items?token=$APIFY_TOKEN"
```
