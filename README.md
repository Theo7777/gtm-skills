# GTM skills

Built by [Theo Ohene](https://theoohene.com). GTM operator, in startups since 2011. Over 15 years I've worked with more than 25 startups and scale-ups from seed to Series C, and taught GTM and AI at MIT, UCL, and King's College London.

These are the agent skills I use day to day for positioning, customer research, prospecting, outreach, and ads. Shared free under an MIT licence. I'm adding more over time, so star or watch the repo.

If you want hands-on help, [Skyamo](https://skyamo.com) is my consultancy covering product marketing, lifecycle, ads and content. If you want your team to build workflows like these, [Riffspace](https://riffspace.ai) runs AI training workshops for GTM teams.

## Start here

Run `gtm-context` first. It builds one shared file, `.agents/product-marketing.md`, that holds your product, customer, positioning, proof, and voice. Every other skill reads it, so you answer the basics once.

If you already use Corey Haines's [marketingskills](https://github.com/coreyhaines31/marketingskills), there's nothing to redo. These skills read the same file.

## Skills

| Skill | What it does |
|---|---|
| `gtm-context` | Builds and maintains the shared GTM context file the other skills read |
| `positioning-messaging` | Positioning, messaging building blocks, and website copy, worked top-down |
| `jtbd-research` | Jobs-to-be-done research from reviews, forums, and interviews, with a quote bank |
| `icp-scoring` | Scores a target account list against your ICP and buying signals, with reasons |
| `linkedin-connection-analysis` | Turns your LinkedIn connections export into a prioritised network list for a goal |
| `find-tech-prospects` | Builds a prospect list from companies running a named tool, filtered by tenure, recency, and confidence |
| `normalise-outreach-names` | Cleans first names and company names so merge fields read naturally |
| `cold-outreach` | Writes one signal-led cold email or LinkedIn message for a named person |
| `ad-headline-maker` | Ad headlines using the core benefit plus objection crusher formula |
| `ad-description-maker` | Ad descriptions using problem, solution, and benefit, within platform limits |
| `ad-message-maker` | Three static ad variations in Figma that test three different messages |
| `deep-ad-research` | Pulls competitor ads from the Meta Ad Library and transcribes video ads |
| `linkedin-post-distill` | Labels a LinkedIn post with a one to three-word topic, in the author's own words |

## Install

Copy the folders you want from `skills/` into your agent's skills folder:

- Claude Code: `~/.claude/skills/` (all projects) or `.claude/skills/` (one project)
- Codex and other agents: `~/.agents/skills/` or `.agents/skills/`

Three skills need API keys or tools of your own. Each has a Setup section:

- `find-tech-prospects`: the TheirStack and Apollo MCP connectors, and optionally lemlist
- `deep-ad-research`: an Apify token and an OpenAI key
- `ad-message-maker`: the figma-console MCP, and optionally an OpenAI key for images

## How each skill is built

Every skill follows the same shape:

1. Check the shared context file.
2. Ask up to five questions for anything missing, and flag assumptions rather than block.
3. Do the work.
4. Run a quality checklist before handing it over.

Each skill has an `evals/evals.json` file with test prompts and assertions, so you can check changes against a baseline.

## Credits

Frameworks borrowed from others are credited inside each skill. The main ones:

- April Dunford, Fletch PMM, and Julian Shapiro (`positioning-messaging`)
- Julian Shapiro (`ad-headline-maker`)
- Clayton Christensen, Bob Moesta, and Chris Spiek (`jtbd-research`)
- Common Room's signals library and Za-zu's cold email handbook (`cold-outreach`)
- Corey Haines's marketingskills, for the shared context file idea (`gtm-context`)

## Licence

MIT. See `LICENSE`.
