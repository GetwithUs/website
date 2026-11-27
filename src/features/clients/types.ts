type ClientLinkType = "website" | "android" | "ios" | "none";
type ClientStatus = "draft" | "published";

export type ClientMilestoneView = {
  id: string;
  clientId: string;
  title: string;
  description: string;
  milestoneDate: Date | null;
  sortOrder: number;
};

export type ClientView = {
  id: string;
  name: string;
  slug: string;
  industry: string;
  tagline: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  projectBrief: string;
  servicesDelivered: string[];
  techStack: string[];
  projectUrl: string | null;
  linkType: ClientLinkType;
  resultHighlights: string[];
  testimonialText: string | null;
  testimonialAuthor: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isFeatured: boolean;
  displayOrder: number;
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
  milestones?: ClientMilestoneView[];
};
