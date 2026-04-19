# PassAudit — Password Strength Analyzer

A cybersecurity tool for analyzing password strength, estimating crack times, and generating cryptographically secure passwords. Built with vanilla HTML, CSS, and JavaScript — zero dependencies.

![PassAudit Screenshot](https://via.placeholder.com/860x480/0a0c0f/00ff88?text=PassAudit)

## Features

- **Real-time strength analysis** — Entropy calculation, composition stats, and a visual strength meter
- **12 security checks** — Length, character diversity, sequences, keyboard patterns, dictionary words, date patterns, and more
- **Crack time estimates** — Projected times for online attacks, offline MD5, and bcrypt across 4 attack vectors
- **Advisory log** — Actionable, specific feedback for each password
- **Secure password generator** — Uses `crypto.getRandomValues()` with configurable length and character sets
- **No server, no tracking** — Everything runs client-side in your browser

## Security Checks

| Check | Description |
|-------|-------------|
| Min. 12 characters | Enforces a reasonable minimum length |
| Uppercase letters | A–Z present |
| Lowercase letters | a–z present |
| Numeric digits | 0–9 present |
| Special symbols | !@#$% etc. present |
| No repeated chars | Detects `aaa`, `111` etc. |
| No sequences | Detects `abc`, `123`, `zyx` |
| Not a common password | Checks against 60+ common passwords |
| No dictionary words | Matches against 200+ common words |
| No keyboard patterns | Detects `qwerty`, `asdfgh`, `zxcvbn` etc. |
| No date patterns | Detects years, MM/DD, month names |
| Entropy ≥ 60 bits | Shannon entropy threshold for adequate security |

## Entropy Calculation

Password entropy is calculated as:

```
H = L × log₂(R)
```

Where:
- `H` = entropy in bits
- `L` = password length
- `R` = pool size (sum of: 26 lowercase + 26 uppercase + 10 digits + 32 symbols, as applicable)

Crack time estimates assume the attacker has the hash and uses:
- **Online (throttled):** 100 guesses/sec (rate-limited login)
- **Online (unthrottled):** 10,000 guesses/sec (no throttle)
- **Offline MD5:** 10 billion guesses/sec
- **Offline bcrypt:** 20,000 guesses/sec

## Getting Started

```bash
git clone https://github.com/yourusername/passaudit.git
cd passaudit
# Open index.html in your browser
open index.html
```

No build step. No npm install. Just open and go.

## File Structure

```
passaudit/
├── index.html    # Structure and markup
├── style.css     # Dark terminal aesthetic styles
├── app.js        # Password analysis engine
└── README.md     # This file
```

## Usage

1. Type a password into the input field — analysis runs in real-time
2. Review the strength meter, composition breakdown, and security checks
3. Read the advisory log for specific improvement suggestions
4. Use the generator to create a strong password with your preferred settings

## Contributing

Pull requests welcome. Areas for improvement:
- Expand the common password list (e.g. integrate HaveIBeenPwned API)
- Add zxcvbn-style pattern matching
- Support passphrase generation (word-list based)
- Add clipboard history detection

## License

MIT License — free to use, modify, and distribute.

---

Built as a cybersecurity portfolio project. Demonstrates client-side security analysis, entropy mathematics, and secure random number generation.
