# API traps

Each of these failed quietly at least once. Read this before the first API call.

Tool names below are the ones the MCP connectors expose. Plans and connectors change, so if a tool behaves differently from what is written here, trust what you see and tell the user.

---

## TheirStack

### Find the slug first

Technology filters take slugs, and slugs are case sensitive. Look the tool up in the keyword catalogue (`get_catalog_keywords` with `q` and `keyword_type: "technology"`). The lookup is free. Guessing a slug returns an empty result that looks like "nobody uses this".

### Every company returned costs 3 credits

`search_companies` charges per row, so `limit` is the spend control. Set it to the approved number. A request with `limit: 1` and `include_total_results: true` shows the size of the market for 3 credits, which is a cheap way to check the filters before a full pull.

### Filter on the signal in the request

Pass the signal settings inside `tech_filters` so stale rows are never returned or paid for:

| Setting | Field |
|---|---|
| Confidence | `confidence_or: ["high"]` |
| Seen recently | `last_date_found_gte: "YYYY-MM-DD"` |
| Established users | `first_date_found_lte: "YYYY-MM-DD"` |
| New adopters | `first_date_found_gte: "YYYY-MM-DD"` |

Also pass the slug in `expand_technology_slugs`, so each row carries `technologies_found` with `confidence`, `first_date_found`, `last_date_found`, and the job count. Then check the returned rows against the settings yourself. Treat the request filters as a saving, not a guarantee.

### Confidence is not recency

`confidence: "high"` says nothing about when the tool was last seen. Always read `last_date_found`.

### First seen is a floor

`first_date_found` is the first job advert that mentioned the tool. The company may have run it for years before that advert. Report tenure as "at least".

### The response is too big to read directly

Rows include long descriptions and full job objects, so even a dozen rows can exceed the context limit. The result is saved to a file. Parse the file instead of shrinking the request:

```bash
F=<path from the tool result>
jq -r '.metadata' "$F"
jq -r '.data[] | [.name, .domain, .country_code, (.employee_count|tostring), .industry,
  (.technologies_found[0].confidence // "-"),
  (.technologies_found[0].first_date_found // "-"),
  (.technologies_found[0].last_date_found // "-")] | @tsv' "$F" | column -t -s$'\t'
```

Useful fields: `name`, `domain`, `country_code`, `employee_count`, `industry`, `city`, `linkedin_url`, `technologies_found[]`.

### Paging

Use `offset` for a second batch, and only after the user approves the extra credits. Set `include_total_results: true` on the first call only. It is slow.

### Excluding recruiters

`company_type: "direct_employer"` removes recruiting agencies. It does not remove consultancies or marketing agencies, so check the industry and description on each row.

---

## Apollo

### Check the balance and the plan first

`apollo_users_api_profile` with `include_credit_usage: true` and `include_waterfall_capability: true`. Revealing an email costs about one credit per contact.

### People search can be blocked by plan

On some plans `apollo_mixed_people_api_search` returns an access-denied error. `apollo_agent_find_prospects` and `apollo_contacts_search` (the team's own saved contacts) may still work. Route through the agent when search is blocked.

### Exact filters or the agent, not a mix

Use people search directly only when the user gave exact titles, seniorities, and locations. Pass the company domains in `q_organization_domains_list`. If the user described a persona ("whoever owns analytics"), use the agent and pass their words as written, with the domains appended after a `Context:` line. Rewriting the request into filter language narrows the search in ways that are hard to see.

### Person location and company location are separate filters

`organization_locations` matches the company's headquarters. `person_locations` matches where the person sits. Setting only the first returns employees anywhere in the world.

### Search results carry no emails

Search finds people. Emails come from enrichment: `apollo_people_bulk_match`, 10 people per call at most, using the `id` from the search result. Leave `reveal_personal_emails`, `reveal_phone_number`, and both waterfall flags off.

### The agent is slow and asks for approval

Expect several minutes. It can raise two prompts mid-run:

1. Waterfall enrichment is off, so it asks whether to use Apollo-only data. That is the standard path.
2. A credit confirmation, such as "will consume 11 credits". Show the number to the user before replying.

### The agent may not print the emails

It saves contacts to the account and may write "See Apollo profile" in place of the address. Do not enrich again. Read them from saved contacts with `apollo_contacts_search` sorted by `contact_created_at`, and filter by the target domains, because the response includes contacts from earlier work.

### Catch-all domains

`email_status: "verified"` with `email_domain_catchall: true` and a `warn` verdict means the domain accepts anything, so the address is unconfirmed in practice. Flag these.

### Some companies are absent

A company missing from Apollo stays missing on retry. Say so and move on.

---

## lemlist

### The create response can misreport the status

`create_campaign_with_sequence` has returned `"status": "running"` for a campaign that was in draft. Confirm with `get_campaigns`, and trust that.

### Adding leads

`add_leads_to_campaign` takes up to 100 leads per call and removes duplicates on its side.

Keep every enrichment flag off unless the user asks. Each is charged on success:

| Flag | Cost |
|---|---|
| `findEmail` | 5 credits per email found |
| `verifyEmail` | 1 credit per email verified |
| `findPhone` | 20 credits per number found |
| `linkedinEnrichment` | 1 credit per profile |

Send `companyDomain` alongside `companyName`. A name on its own creates a duplicate company record.

### Launching

`launch_campaign` starts a draft and `set_campaign_state` resumes a paused one. This skill calls neither.
