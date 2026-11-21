# Driver95 growth improvements — 21 November 2026

- Language landing CTAs use an explicit `start` language and carry campaign parameters to the trainer, including modified/new-tab clicks. Recognized launch languages skip language/theme onboarding and open the mode menu; ordinary visits retain onboarding. Existing per-language progress is loaded, never cleared.
- Entry heading/description and tab title follow the chosen language. A deliberate landing launch suppresses the competing browser-language suggestion.
- Material-scope notices appear near landing CTAs and on the mode menu in all eight trainer languages. They distinguish language from a country's official exam bank.
- After a result, an optional training-provider interest button records `partner_interest`; confirmation explicitly says no enquiry was sent. No form, contact details, partner promise or automatic message. This is interest, not a qualified lead.
- Existing `test_finished` remains deduplicated and carries `mode`; it is not counted again as a new completion event.
- Attempt events include `practice_days_7d` and `returning_practice_7d` based on practice in this browser on another local day within the previous seven days. This is a rolling repeat-practice indicator, not a cohort retention rate or cross-device identity.
- Campaign slug parameters (`acquisition_source/medium/campaign/content/term`) accept only 1–80 letters/digits/underscore/dot/hyphen. Arbitrary query strings and click IDs are not copied into custom parameters. Normal UTM attribution is preserved in the trainer URL. Use slugs, never personal data, in campaign links.
- GA4 custom dimensions/metrics for new fields require registration for standard custom reports; no GA4 property settings or key-event flags were changed. Existing first-answer, ten-question and exam-mode completion events remain the funnel source.
- Service-worker cache version bumped; sitemap lastmod updated for the changed pages. No question content, studio queue, YouTube or Telegram changes.

Validation: Node analytics/ecosystem tests (10); syntax and whitespace checks; local browser PL landing → localized mode menu → Polish quiz with campaign/test markers retained. Localhost traffic is excluded from GA delivery by the existing analytics guard.
