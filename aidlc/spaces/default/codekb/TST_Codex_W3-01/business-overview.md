# Business Overview

## Purpose and bounded domains

LinerCore is an enterprise liner-shipping operational platform. Its bounded services cover identity, reference data, customer booking, Charge Agreement/pricing authority, and container movement. The web applications provide authenticated operational workbenches over those service APIs.

Charge Agreement is the commercial authority: it owns rates, agreement versions, pricing resolution, manual-pricing handling, and the Charge-side UI. Booking is its synchronous consumer for booking-time pricing and is the future consumer of D&D evaluation; Container Movement owns movement status but, by contract, does not own a D&D ruleset.

## W3-01 relevance

W2-03 already provides versioned Rate/RateVersion and Agreement/AgreementVersion authority, the additive `contracts/openapi/pricing.v1.yaml`, and a Charge-to-Booking pricing seam. W3-01 must extend that provider-owned capability with D&D rule types, rate terms, evaluation, and explanation while preserving the approved pricing behaviour.

The bilateral contract defines the future `pricing.dnd-request`/`pricing.dnd-result` seam and pins the MVP DCSA codes to `DISC`, `GTOT`, and `GTIN`. Existing Booking code has a `DndPricingPort` and stores an observed result, but the provider endpoint and authoritative Charge rule/rate evaluation remain the vertical work for this intent; W3-02 owns the live Booking trigger and invoice behaviour.

