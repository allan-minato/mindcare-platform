import { notFound } from "next/navigation";

import {
  renderRobotsTxt,
  robotsResponse,
} from "@/lib/sites/sitemap";
import { getPublishedByHost } from "@/lib/tenant";

export const instant = false;

type RouteProps = {
  params: Promise<{ host: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { host } = await params;
  const published = await getPublishedByHost(host);
  if (!published) {
    notFound();
  }
  return robotsResponse(renderRobotsTxt(published));
}
