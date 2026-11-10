# Rouh CRM frontend change report

The revamp focused on making daily work easier for AIESEC in Egypt’s LC members and leaders. It kept Rouh’s colors and fonts and reused the existing Django routes, forms, and permissions.

## What changed

| Area | Changes |
| --- | --- |
| Navigation and landing | Added icons that match each desk. The collapsed menu stays clickable and shows labels on hover or keyboard focus. The Rouh logo opens the public landing page. The sidebar scrollbar is hidden across the app while the menu remains scrollable. On narrow screens, navigation opens from a Menu button. |
| Layout and accessibility | Refreshed desk headers, tables, filters, forms, and empty states. Added a skip link, clearer keyboard focus, and a sideways-scroll hint for wide tables. |
| Bulk assignment and attendance | Added larger checkboxes, selection counts, and controls to select a page or clear the selection. Existing assignment actions work on selected records where permitted. Talent attendance lets members apply a mark to multiple selected people before saving the roster. |
| Exchange | Added **My follow-up** for assigned records without a recorded contact date on the current page. Members can see contact context, review the next record, and return to the same queue and filters. |
| Raising, B2B, and BD | Added action groups for first contact, upcoming visits, and follow-up. Records show the owner and suggested action. Upcoming visits are ordered by date within the current page. |
| B2C | Added **My handoffs** for assigned interviews, grouped by B2C contact, OGX follow-up, and interview history. The record shows the B2C owner and recorded contact status. Pagination retains the current search and filters. |
| Recruitment | Added **My candidates** using the existing assigned-work queues. Recruiters can open Quick view or step through full records in a group. Closing the drawer returns keyboard focus to the control that opened it. |
| People, Talent, and reporting | Improved the People directory search feedback, Join Requests layout, Talent overview and HR board, and navigation within OD reports. Also refreshed parts of Finance, BD cash-in, and the notification inbox. |
| Save feedback | Added clearer pending and retry states to Exchange and partner edits. The interface can confirm a save when Django returns the acknowledgement described in the integration guide. |
| Local preview | Added sample landing, sign-in, and sign-up pages, plus shortcuts to key workflows. Preview forms show feedback without saving records. Links that need the full app show an explanation. |

## Verification and Django handoff

- Checked 238 saved preview pages for horizontal overflow at three screen widths. Browser checks also covered sidebar navigation, bulk selection, queue navigation, and preview save feedback.
- Live role permissions and database saves still need testing in the full Django app. Send this report and the frontend checkout or diff to the webapp admin along with [backend-changes-required.md](backend-changes-required.md).
- Bulk status transitions, scheduled follow-ups, and formal B2C handoff acceptance require additional backend work. The integration guide documents those requirements separately.
