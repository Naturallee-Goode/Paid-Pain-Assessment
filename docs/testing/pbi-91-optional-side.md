# PBI #91: Optional side selection

The Side control is labeled optional and explains that Left, Right, and Both refer to the client's body. It starts with no selection and includes a keyboard-accessible **Clear side** button. Visible radio state, status text, shared body-map state, geometry filtering, and the submitted EmailJS value are driven by the same selection.

Changing the body area or resetting the form clears the side. Clearing only the side retains the selected area and logical muscle. If the model has no geometry matching a selected side, the viewer does not substitute or invent a counterpart. Submissions without a side send `Not specified`.

## Automated evidence

- `npm run test:body-map`: covers initial blank state, Left/Right/Both, clearing, focus restoration, area changes, resets, missing counterparts, and specified/unspecified email payloads.
- `npm run test:browser`: covers the integrated model, no-side use, keyboard clearing, retained logical muscle, synchronized visible/store state, and confirms that the workflow does not accidentally submit the form.
- `npm run lint:html`: validates the updated form markup.

## Screenshots

- `evidence/pbi-91/side-not-specified.png`: optional control with no selected side.
- `evidence/pbi-91/side-left-selected.png`: selected-side state with the Clear side action enabled.
