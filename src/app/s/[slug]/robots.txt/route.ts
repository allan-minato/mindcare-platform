import { notFound } from "next/navigation";

import {
  renderRobotsTxt,
  robotsResponse,
} from "@/lib/sites/sitemap";
import { getPublishedBySlug } from "@/lib/tenant";

export const instant = false;

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const published = await getPublishedBySlug(slug);
  if (!published) {
    notFound();
  }
  return robotsResponse(renderRobotsTxt(published));
}
