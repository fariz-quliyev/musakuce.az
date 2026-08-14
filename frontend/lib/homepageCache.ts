/**
 * Phase 14 §2 — the homepage previously made ~10 fully-uncached API
 * calls on every single request (Phase 12 finding). A flat, short
 * time-based revalidate window is the simplest fix that doesn't touch
 * admin pages or introduce a tag-based on-demand invalidation system
 * across every admin publish/unpublish/archive action.
 *
 * 60 seconds: short enough that "admin just published something" never
 * feels stale for an unreasonable period (the spec's own bar), long
 * enough to absorb repeat homepage loads without re-hitting the backend
 * for every visitor. Not applied anywhere else — every other public
 * list page and every admin page keeps today's always-fresh behavior.
 */
export const HOMEPAGE_REVALIDATE_SECONDS = 60;
