"use client";
import { notFound, useParams } from "next/navigation";
import { CollectionList } from "@/components/admin/CollectionList";
import { COLLECTIONS } from "@/lib/admin/specs";

export default function CollectionPage() {
  const { collection } = useParams<{ collection: string }>();
  const cfg = COLLECTIONS[collection];
  if (!cfg) notFound();
  return <CollectionList cfg={cfg} />;
}
