# Rouh frontend integration handoff

This checkout contains frontend templates and static assets. The changes in this pass reuse existing Django assignment endpoints. The backend work below is proposed for integration in the full Django project.

## Connect this frontend to the Django app

1. Create an integration branch in the full Django repository. Review and merge the changed Django templates under `templates/` and shared assets under `static/` into their matching locations. Merge shared files such as `templates/base.html`, `templates/partials/nav.html`, `static/css/app.css`, and `static/js/app.js` against the full app's current versions so backend-specific features and newer changes are preserved. Use the existing Django template and static asset configuration. The `preview/` directory contains saved sample pages and stays out of the deployed app.
2. Render the changed pages against the real views and context. Confirm that Django resolves the existing named routes and template tags, that static assets load through the deployed asset pipeline, and that HTMX swaps preserve their targets and CSRF handling. Verify `assign` and pagination context on the queues, `person.b2c_interview` on B2C records, and `mine` and `phases` on Recruitment Today. Keep existing form field names, endpoint behavior, and server-side authorization.
3. Run the full app's existing tests and prepare staging with a sample LC, term, desk assignments, and test users for member, team leader, VP, and LCP. Seed owned, unassigned, other-team, and other-LC records, plus enough records for a second page. Use the backend's permission rules as the expected results for each role.
4. Walk through the staging checks below before deploying. Use the full app's standard static asset build and deployment process. Keep the previous templates and assets available together for rollback.

| Staging check | What to verify |
| --- | --- |
| Navigation and permissions | Each test role sees the correct desks, teams, queues, and actions. The server enforces the same scope when opening or submitting a record. Switching entity or term updates that scope. |
| Assignment and attendance | Select several rows and submit an allowed assignment. Reload to verify the intended records changed. Check bulk attendance against the existing roster save. |
| Exchange, partner, B2C, and Recruitment queues | Check grouping against seeded records, navigate to the next record, and return to the same queue and filters. Check B2C pagination and Recruitment Quick view. |
| Save and retry | Confirm a successful edit survives reload. Test validation and a failed request. Verify the edit stays available for retry and that the UI reports the server outcome using the acknowledgement contract below. |
| Desktop and mobile | Verify the sidebar, keyboard navigation, and wide tables in the browsers used by members. |

The frontend can be integrated with the existing endpoints first. Bulk status transitions, scheduled follow-ups, and formal handoff acceptance require the backend work described below.

## Existing requests used by the frontend

| Surface | Django URL name | Repeated ID field |
| --- | --- | --- |
| Exchange signups, applications, applicants, and APDs | `exchange:desk_assign` with the desk code | `person_ids` |
| Raising accounts | `raising:assign` with the desk code | `account_ids` |
| B2B and BD accounts | `b2b:accounts_assign` with `?desk=` | `account_ids` |
| B2C accounts | `b2c:accounts_assign` | `account_ids` |
| B2C interviews | `b2c:interviews_assign` | `person_ids` |
| Recruitment leads | `rcr:leads_assign` with the cycle slug | `lead` |

The shared frontend uses the existing `intent` values and leaves CSRF, return URLs, queue and team context, and target fields in place. Exchange APD assignment acts on the participant ID, so selecting one participant selects any of their other visible APD rows and submits the ID once. Recruitment keeps its `scope=ticked` and `scope=matching` modes, `filters` and `kind` context, and existing `action`, `recruiter`, and `share_to` fields.

Bulk attendance prepares marks in the browser and uses the existing attendance save. The POST still sends `state_<row ID>` and `note_<row ID>` for the roster. The selection controls and shared status picker have no submitted names.

## Required for bulk status updates

Add a separate POST handler per record type or a shared handler with an explicit registry of supported record types. Reuse the single-record transition and validation services behind the pages below. Existing assignment handlers can keep their current interfaces.

| First status actions to support | Existing single-record workflow to reuse |
| --- | --- |
| Exchange contact status and applicable process status | `exchange:person_detail` and its `status` form |
| Raising and B2B or BD contact status | `raising:detail` and the B2B account detail status form |
| Recruitment lead stage | `rcr:lead_row` within its recruitment cycle |

Agree on a POST contract before wiring the controls. Suggested fields are repeated record IDs, a server-defined action key, a target value, scope identifiers such as desk or cycle, and a validated local return URL. Use separate application or experience IDs for any future application-level or APD experience update. Participant IDs represent assignment targets only.

- Scope every lookup to the signed-in user's authorized entity, term, desk or cycle, team, and action permissions. Recheck authorization for each selected record on submission. Treat client-provided scope and identifiers as input.
- Expose only the actions the user may perform. Compute allowed target values from the intersection of valid transitions for the selected records, and recompute that intersection before writing. Reject the entire request if a record is inaccessible, missing, stale, or unable to make the transition.
- Deduplicate IDs, cap batch size, and reject empty batches. Apply the updates atomically with the same audit entries, notifications, and side effects as single-record edits. Protect against concurrent changes using record locks or version checks appropriate to the existing service. Handle repeat submissions without duplicating side effects.
- Return a success count or a clear validation error that preserves the user's filter context. Add the supported action metadata to the queue context so the frontend can render only usable controls. Status controls can be integrated after this contract exists.
- Verify mixed permissions, different current statuses, repeated IDs, stale records, rollback, and audit effects. Include a valid batch and a batch that must be rejected without updating any record.

## Later workflow decisions

Review editable record lists in People and Join Requests, Talent HR, Recruitment interviews and scheduling, B2C campaign approvals, and BD cash-in approvals. Agree on which existing single-record operations may be batched and which require individual review or per-record inputs. Keep read-only reporting filters and single-choice fields separate from record selection.

## Autosave acknowledgement

The Exchange and partner detail forms display a pending state, keep the current edit on failure, and allow retry through the same POST. Requests from one form are serialized so rapid changes reach the endpoint in order.

On a successful write, return `X-Rouh-Save-State: saved`. Return the existing validation fragment with `data-autosave-error` on its error message, or a non-2xx status for failed requests. The client displays “Changes saved” only after the explicit acknowledgement. Existing successful responses without the header display “Update sent” and direct the user to the activity log.

## Exchange follow-up schedule

The current My follow-up shortcut works with the signed-in user's existing My work queue and the contact dates on its current page. A dated “Follow up today” queue needs a scheduled follow-up date (or another server-defined due rule), an explicit completed or cleared state, and the existing scoped assignment permissions. Return the due and overdue records across the full queue in deterministic order with the same filters and pagination. Use the LC or user time zone for day boundaries. A missing contact date alone does not mean a record is overdue.

## Partner follow-up scheduling

Raising, B2B, and BD next actions currently use the visible queue page, existing contact status and dates, and existing visit scheduling and completion fields. Upcoming visits are reviewed by recorded visit date. To support reminders, an explicit “Waiting for reply” queue, or ordering across all pages, provide the applicable reply state and scheduled follow-up date in Django and scope the resulting queue to the user's existing account permissions. A recorded contact alone does not establish that a partner owes a reply.

## B2C handoff tracking

The customer interview queue uses the current B2C assignee and existing B2C contact, OGX contact, and return-to-process values. For formal handoffs, expose the sending and receiving members or teams, the time sent, the acceptance state and time, and the latest handoff note. Apply the existing visibility rules to both sides. A receiving member's full queue should be filtered and paginated server-side once those fields exist.
