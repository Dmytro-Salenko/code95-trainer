# Driver95 analytics — 2026-11-07

## GA4 property 544168851

Existing Mode (`mode`) remains unchanged. Added event dimensions:
- App Language (`app_language`): selected app language, not browser locale.
- Test Result (`test_result`): passed/failed for exam; completed for other modes.
- Exit Reason (`exit_reason`): navigation, new_session, page_exit, favorites_removed.
- Practice Frequency (`practice_frequency`): one_day_30d / multiple_days_30d.
- Exam Completion Frequency (`exam_completion_frequency`): none / one / multiple.

Existing metrics Correct Count, Incorrect Count, Score percentage and Duration are retained. Duration uses `duration_seconds`; the completion event now sends that registered name. Filter to `test_finished` when aggregating completion metrics: result_screen_viewed can also carry duration, and learning_progress carries incorrect_count.

## Attempts and outcomes

A quiz attempt emits at most one test_started and one terminal test_finished OR test_abandoned per session ID in the page lifetime. Terminal event UUID stays in the local queue; never overrides GA4's session_id. Exam success follows existing UI threshold ceil(total_questions * 0.8); this is a simulator result, not certification.

Learn and last-answer modes also emit completion when their changing question list becomes empty. Removing the last favorite is an abandonment, not a successful completion. Existing screen flow is preserved. Browser back-forward cache does not terminate a resumable attempt. Page exit delivery remains best effort, especially on mobile process termination. No timer exists, so no timeout event is invented.

## Repeat practice

Dates and completed exam counts start when this version is first used. Local calendar days are kept for a rolling 30-day window; cumulative completed exams are browser-local. Changing devices, clearing storage, private mode and blocked storage limit accuracy. No claim of verified unique people or cross-device matching.

## Excluding our own testing

Open https://driver95.eu/?analytics_test=1 once on each test browser. It sets a browser-local flag. While enabled, GA4 is not loaded and NO events are sent to GA4 or the optional backend. Events remain in the bounded local queue for QA. localhost/127.0.0.1 also automatically use this mode. Disable with https://driver95.eu/?analytics_test=0 . Do not distribute the test link to ordinary users.

The existing GA4 Internal Traffic filter was inspected and remains in Testing; no broad IP/country filter was activated. This source-side exclusion works without that filter. Old traffic cannot be reliably retroactively removed. Analytics.enableDebug alone is diagnostic and can still send data to GA4; use analytics_test for safe routine QA. Smoke tests require explicit debug/test mode.

## Reading reports

Events: filter test_finished + Mode=exam, then use Total users (not event count). Break down by Country, App Language, Test Result and the repeat-frequency dimensions. Country describes the visit location, not intended examination country. New definitions may need processing time and do not backfill old events.

## Validation

node --test tests/analytics.test.cjs
node --check analytics.js
node --check app.js

Local browser: completed 40-question exam to result, console contained no errors. Automated checks cover deduplication, terminal exclusivity, language mapping, duration, pass threshold, rolling days, repeat exams, test opt-in/off and learn completion.
