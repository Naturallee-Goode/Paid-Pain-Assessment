# QR Code Generation

## Decision

Use [QRCode Monkey](https://www.qrcode-monkey.com/) to generate QR codes for the project.

## Current Asset

The approved QR code is stored at [`assets/qr-codes/project-qr-code.png`](../assets/qr-codes/project-qr-code.png).

**Verification:** Successfully scanned on an iPhone and confirmed to open the intended destination on November 10, 2026.

## Rationale

- Free for personal and commercial use
- Static QR codes do not expire and have no scan limit
- Supports high-resolution PNG and SVG downloads, custom colors, and logos
- Does not require a paid subscription for the project's current needs

## Limitations

- Generated codes are static: the destination cannot be changed after creation
- Scan analytics and other dynamic-code features are not included
- QRCode Monkey states that generated image files may be cached on its servers for 24 hours, so sensitive data should not be encoded

## Usage

1. Confirm the final destination URL before generating the code.
2. Generate and download an SVG for print use (or PNG for digital use).
3. Test the downloaded code on multiple devices before publishing.
4. Replace the repository asset only after the new code passes testing.

_Reviewed: November 10, 2026. Reconfirm service terms before future production use._
