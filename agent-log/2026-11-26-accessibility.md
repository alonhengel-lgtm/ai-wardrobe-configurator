# Accessibility (IS 5568 / WCAG 2.0 AA)

## Asked
Add accessibility according to Kol Zchut's guidance (kolzchut.org.il, "נגישות" and the page on making
websites and apps accessible). Israeli sites that serve the public must follow IS 5568, which is based
on WCAG 2.0, and must publish an accessibility statement covering: how the site was made accessible,
how to use it, what is not accessible and the alternatives, and how to contact the operator.

## Done
Branch `feature/accessibility`, created from `dev`. Not committed or pushed yet; that is waiting for
the user.

- `stitch/tailwind.input.css`: a visible `:focus-visible` outline that overrides the `focus:outline-none`
  utilities, a `.skip-link` style, and support for `prefers-reduced-motion`.
- Every page (public and staff): a "Skip to main content" link and `<main id="main" tabindex="-1">`.
- New `frontend/accessibility.html`: the accessibility statement. It is linked from the footer of the
  6 public pages.
- Labels: `aria-label` on the dimension number inputs and sliders (index, configurator), on the price
  and currency fields (staff/quotation), on the note textarea (staff/request), on the search box and
  the pagination buttons (staff/requests).
- `js/configurator.js`: the 3D canvas gets `role="img"` and a text description.
- Colour contrast: the design tokens in `stitch/tailwind.config.js` were darkened, with the user's
  approval: primary/sienna/surface-tint/sahara-primary `#c2652a` → `#9d5222`, secondary `#78706a` →
  `#6c655f`, subtle-text → `#6d655f`, sienna-hover → `#84441c`. A few one-off classes were also
  fixed (ai-proposal, interior, configurator bay badge, staff/versions nav, staff/sign-in).
  `css/styles.css` was regenerated with tailwindcss 3.4.17.

## Verified
- pytest: 73 passed. node geometry tests: 5 passed.
- A browser check on headless Edge via playwright-core plus axe-core 4 (scripts in the session's
  scratchpad, not in the repo). It covered all 12 pages: zero WCAG 2 A/AA violations from axe; the
  first Tab lands on a visible skip link; Enter moves focus to main; no JS errors. Configurator flow:
  the design loads, the canvas has role=img, and width typed by keyboard updates to 2000 with no error.

## Decisions
- Contrast was fixed at the token level instead of element by element, so new pages inherit it.
- An overlay "accessibility widget" was not added. The law does not require one, and the fixes are in
  the markup itself.
- The statement is in English to match the site.

## Open
- The contact details in `accessibility.html` are `[TO FILL: ...]` placeholders (coordinator, phone,
  email, address, reply time). They are legally required.
- Manual screen-reader testing (NVDA/VoiceOver) and a 200% zoom check were not done.
- The 3D view cannot be rotated from the keyboard (documented as a limitation in the statement).
- The deletion of `backend/.env.example` in the working tree came from the user, not this task. It was
  not touched.

## Shipped
Commit 3f1ac41 on `feature/accessibility`. The user's GitHub account has no write access to the
upstream repo, so with the user's approval it was pushed to the fork
`alonhengel-lgtm/ai-wardrobe-configurator` (git remote `fork`). PR #8 into `dev`:
https://github.com/JonathanZouari/ai-wardrobe-configurator/pull/8. Security review: no findings.

## Follow-up: what the law requires, built in the site itself
The user asked for the requirements to be implemented, not only described. Added on the same branch:
- **Keyboard control of the 3D view** (WCAG 2.1.1): the canvas is focusable (`role="application"`);
  arrow keys rotate and `+`/`-` zoom, clamped to the same limits as OrbitControls.
  Code: `js/configurator.js`.
- **Accessibility menu** on all 12 pages (`js/a11y-menu.js`, styles in `stitch/tailwind.input.css`
  outside `@layer`). It offers text size 100–150% (scales the root font size, so rem-based layout
  scales with it), high contrast, underline links, readable font and stop animations, plus reset and
  a link to the statement. Choices are saved in localStorage (`a11y-preferences`). Escape closes the
  menu and returns focus to its button.
- The statement was updated to describe the menu and the 3D keys.
Verified in headless Edge: every page opens the menu by keyboard; axe finds 0 violations with the
menu open; Escape works; the options apply and persist across pages; reset works; no horizontal
scroll at 720px width (equivalent to 200% zoom); arrow keys change the 3D render and do not scroll
the page. pytest 73 passed, node tests 5 passed.
Still open: the contact placeholders in the statement, and manual screen-reader testing.
