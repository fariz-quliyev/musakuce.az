"use client";

import { PublicationStatusActions } from "@/components/admin/PublicationStatusActions";
import { peopleApi } from "@/lib/api/people";
import type { PersonDto, PublicationStatus } from "@/lib/api/types";

export function PersonRowActions({ person }: { person: PersonDto }) {
  return (
    <PublicationStatusActions
      status={person.publicationStatus}
      onChangeStatus={(publicationStatus: PublicationStatus) =>
        peopleApi.updateStatus(person.id, { publicationStatus })
      }
    />
  );
}
