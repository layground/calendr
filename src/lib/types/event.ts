export interface RegionEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isPublicHoliday: boolean;
  isOptionalHoliday: boolean;
  labels: string[];
  location: {
    address: string;
    link_to_maps?: string | null;
  };
  image?: string | null;
  source?: {
    name: string;
    link?: string | null;
  };
  region?: string;
  country?: string;
  coverImage?: string;
  accessLabels?: string[];
  articleUrl?: string;
}
