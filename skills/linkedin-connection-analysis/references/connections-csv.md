# Connections.csv notes

## File shape

LinkedIn's export puts a few notes lines above the header, then a blank line. It looks roughly like this (wording varies):

```
Notes:
"When exporting your connection data, you may notice that some of the email addresses are missing. ..."

First Name,Last Name,URL,Email Address,Company,Position,Connected On
Jane,Doe,https://www.linkedin.com/in/example,,Northwind Analytics,Head of Growth,14 Mar 2024
```

Find the header by looking for the line that starts with `First Name`. Do not assume a fixed line number, because the notes text changes.

## Columns

| Column | Notes |
|---|---|
| First Name | Can include emojis, credentials, or pronouns; tidy for display only |
| Last Name | As above |
| URL | Public profile URL; personal data, keep local |
| Email Address | Usually blank; only filled when the member allows it |
| Company | Current company as set by the member; can be blank or stale |
| Position | Current job title as set by the member; free text, often long |
| Connected On | Date in `DD Mon YYYY` format, for example `14 Mar 2024` |

## Parsing snippet (Python, standard library only)

```python
import csv

def load_connections(path):
  with open(path, encoding="utf-8-sig") as f:
    lines = f.readlines()
  header_index = next(i for i, line in enumerate(lines) if line.startswith("First Name"))
  return list(csv.DictReader(lines[header_index:]))
```

## Common issues

- Commas inside Position or Company are quoted, so always use a CSV parser rather than splitting on commas.
- Some older exports use slightly different date formats; parse with a fallback and report any that fail.
- Self-employed people often put their own name or "Freelance" in Company.
- Titles vary widely ("Head of Growth", "Growth Lead", "VP Marketing & Growth"); match on keywords and seniority, not exact strings.
