# Security Policy

## Supported Versions

Only the latest production version at [driver95.eu](https://driver95.eu) is actively maintained.

## Reporting a Vulnerability

If you discover a security vulnerability, **please do not open a public GitHub issue.**

Contact the maintainer directly via GitHub: [@dmytro-salenko](https://github.com/dmytro-salenko)

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact

You can expect an initial response within 72 hours. Publicly disclosed vulnerabilities that affect real users will be patched as a priority.

## Scope

**In scope:**
- Authentication bypass in the admin panel (`/admin`)
- XSS vulnerabilities
- Sensitive data exposure (e.g., admin credentials, analytics data)

**Out of scope:**
- Issues that require physical access to the server
- Issues in `node_modules` not directly exploitable in this application
- Denial of service without significant impact
