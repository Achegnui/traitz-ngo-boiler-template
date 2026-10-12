"use client";
import { useParams } from "next/navigation";
import { PageEditor } from "@/components/admin/PageEditor";

export default function PageEditorRoute() {
  const { slug } = useParams<{ slug: string }>();
  return <PageEditor key={slug} slug={slug} />;
}
