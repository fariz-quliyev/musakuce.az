import { Badge, type BadgeProps } from "@/components/ui/Badge";
import type { ListingStatus, ModerationStatus, PublicationStatus, SubmissionStatus } from "@/lib/api/types";
import {
  listingStatusLabels,
  moderationStatusLabels,
  publicationStatusLabels,
  submissionStatusLabels,
} from "@/lib/api/labels";

const MODERATION_TONE: Record<ModerationStatus, BadgeProps["tone"]> = {
  Pending: "warning",
  Approved: "success",
  Rejected: "danger",
};

const PUBLICATION_TONE: Record<PublicationStatus, BadgeProps["tone"]> = {
  Draft: "neutral",
  Published: "success",
  Archived: "neutral",
};

const LISTING_TONE: Record<ListingStatus, BadgeProps["tone"]> = {
  Active: "success",
  Fulfilled: "info",
  Expired: "neutral",
  Removed: "neutral",
};

const SUBMISSION_TONE: Record<SubmissionStatus, BadgeProps["tone"]> = {
  Pending: "warning",
  Approved: "success",
  Rejected: "danger",
  Converted: "info",
  Archived: "neutral",
};

export function ModerationStatusBadge({ status }: { status: ModerationStatus }) {
  return <Badge tone={MODERATION_TONE[status]}>{moderationStatusLabels[status]}</Badge>;
}

export function PublicationStatusBadge({ status }: { status: PublicationStatus }) {
  return <Badge tone={PUBLICATION_TONE[status]}>{publicationStatusLabels[status]}</Badge>;
}

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return <Badge tone={LISTING_TONE[status]}>{listingStatusLabels[status]}</Badge>;
}

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  return <Badge tone={SUBMISSION_TONE[status]}>{submissionStatusLabels[status]}</Badge>;
}
