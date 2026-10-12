"use client";
import { notFound, useParams } from "next/navigation";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { COLLECTIONS } from "@/lib/admin/specs";

export default function CollectionEditPage() {
  const { collection, id } = useParams<{ collection: string; id: string }>();
  const cfg = COLLECTIONS[collection];
  if (!cfg) notFound();
  return <CollectionForm key={`${collection}/${id}`} cfg={cfg} id={id} />;
}
