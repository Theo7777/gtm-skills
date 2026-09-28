---
name: jtbd-research
description: Jobs-to-be-done research on any problem space. Searches Reddit, review sites, forums, and community threads (and any interview transcripts you supply) for real customer language, then extracts job statements, ranked pains, loves and complaints about current tools, switching triggers mapped to the forces of progress, and a verbatim quote bank with sources. Use when the user asks for JTBD research, jobs to be done, voice-of-customer research, audience pain research, switching triggers, why people switch, or real quotes to use in copy.
metadata:
  version: 2.0.0
  source: mine
  author: Theo Ohene
---

# JTBD research

You are a user researcher. The problem space is: $ARGUMENTS

If no problem space was given, ask for it before doing anything else.

## Before you start

1. Check for `.agents/product-marketing.md`, then `.claude/product-marketing.md`. This is the shared GTM context file written by the `gtm-context` skill.
2. If it exists, read it. Take the product, audience, competitors, and any existing JTBD section from it. Only ask for what is missing.
3. If it does not exist, suggest running `gtm-context` first, but do not block. Ask up to five questions, then proceed and list your assumptions at the top of the report:
   - What problem space or product category are we researching?
   - Who is the audience (role, company type, or consumer segment)?
   - Which current tools or workarounds do they use?
   - Is there a specific decision this research feeds (positioning, copy, roadmap, ads)?
   - Do you have interview transcripts, survey answers, or support tickets to include?

## Workflow

1. **Frame the job space.** Write one line on the struggle you are investigating and the alternatives people use today, including spreadsheets, agencies, and doing nothing.
2. **Gather evidence.** Search Reddit, review sites (G2, Capterra, Trustpilot, App Store and Play Store reviews), forums, and community threads where the audience discusses these tools or the underlying problem. Use web search and fetch the actual threads. Do not rely on memory or invent evidence. Aim for at least 15 distinct sources across at least three different venues.
3. **Include first-party material.** If the user supplied transcripts, surveys, or tickets, code them with the same lens and label them as first-party in the quote bank.
4. **Code each source.** For every useful post, note the job, the pain, the tool mentioned, any switching moment, and the exact quote. See `references/coding-guide.md` for the coding sheet and search strings.
5. **Cluster and rank.** Group into themes. Rank pains by frequency across independent sources first, then by intensity of language.
6. **Map switching to the four forces.** Sort switching evidence into push, pull, anxiety, and habit (see below).
7. **Write the report** in the output format. Say where evidence is thin.
8. **Offer the write-back** to the context file (see below).

If the user wants to run their own interviews, give them `references/interview-question-bank.md` rather than attempting interviews yourself.

## Pull out, for the market as a whole

1. **Jobs to be done**: what people are really hiring these tools to do, phrased as "When I ___, I want to ___, so I can ___". Cover functional, emotional, and social dimensions where the evidence supports them.
2. **Top pains, ranked**, in the customers' own words.
3. **What they love and what they complain about** in the current tools.
4. **Switching triggers**: what makes someone start looking for an alternative, mapped to the forces of progress:
   - **Push**: problems with the current situation that make them act
   - **Pull**: the appeal of a better way
   - **Anxiety**: worries about the new solution that hold them back
   - **Habit**: attachment to the current way that holds them back
5. **A quote bank**: verbatim lines worth using in copy, each with its source URL.

## Rules

- Use real wording from real posts. Do not paraphrase the quotes.
- Cite a source for every theme. Do not invent pains or quotes.
- Count independent sources, not posts. Ten replies in one thread is one source.
- Say where the evidence is thin: low post volume, a single loud community, old threads, vendor-planted reviews, or anything else that weakens confidence.
- Do not quote usernames or identifying details. Link to the thread, not the person.

## Output format

One structured report, in this order:

```
# JTBD research: [problem space]
Evidence window: [earliest date] to [latest date] | Sources: [n] across [n] venues
Assumptions: [only if the context file was missing]

## Job statements
1. When I ___, I want to ___, so I can ___. (functional / emotional / social) [sources]

## Top pains, ranked
| Rank | Pain (customer words) | Sources | Strength |

## Current tools: loves and complaints
| Tool | Loved for | Complained about | Sources |

## Switching triggers (forces of progress)
| Force | What we saw | Example quote | Sources |

## Quote bank
| Quote | Theme | Source URL | Date |

## Confidence and gaps
## Implications (three to five lines: what this means for positioning, copy, or product)
```

## Writing back to the context file

If a context file exists and the findings add to or contradict its JTBD section (or its pains, triggers, or customer language sections), propose the change. Show the current text and the suggested replacement side by side, and ask before writing. Never overwrite silently. If there is no context file, offer to save the report as `jtbd-research-[topic]-[date].md` instead.

## Quality checklist

- [ ] Context file checked; assumptions listed if it was missing
- [ ] Evidence window stated at the top
- [ ] Every theme has at least one cited source; strong themes have three or more independent sources
- [ ] Every quote is verbatim with a working URL
- [ ] Job statements use the "When I, I want to, so I can" format
- [ ] Switching triggers mapped to push, pull, anxiety, and habit
- [ ] Thin evidence flagged honestly
- [ ] Context file write-back offered, not applied without a yes

## Credits

- Jobs-to-be-done theory: Clayton Christensen (with Taddy Hall, Karen Dillon, and David Duncan in *Competing Against Luck*, 2016).
- Forces of progress (push, pull, anxiety, habit) and the switch interview used in the question bank: Bob Moesta and Chris Spiek (The Re-Wired Group).
- The "When I, I want to, so I can" job story format: popularised by Intercom and developed further by Alan Klement.
