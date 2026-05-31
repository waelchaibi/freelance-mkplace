export interface PortfolioItem {
  id: number;
  freelancerId: number;
  freelancerName: string;
  title: string;
  description: string;
  projectUrl: string | null;
  imageUrl: string | null;
  attachmentUrl: string | null;
  technologies: string | null;
  createdAt: string;
}

export interface CreatePortfolioItemRequest {
  title: string;
  description: string;
  projectUrl?: string | null;
  imageUrl?: string | null;
  attachmentUrl?: string | null;
  technologies?: string | null;
}

export interface UploadResponse {
  url: string;
}
