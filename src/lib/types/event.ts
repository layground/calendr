export type AccessLabel = 'parking' | 'wheelchair' | 'kids' | 'public-transport' | 'free-entry'

export interface Event {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  location: {
    name: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  coverImage?: string
  accessLabels: AccessLabel[]
  isPublicHoliday: boolean
  isOptionalHoliday: boolean
  articleUrl?: string
  region: string
  country: string
}

export interface RegionEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: any;
  isPublicHoliday: boolean;
  isOptionalHoliday?: boolean;
  coverImage?: string;
  accessLabels?: string[];
  articleUrl?: string;
  region?: string;
  country?: string;
}

export interface Country {
  code: string
  name: string
  regions: Region[]
}

export interface Region {
  code: string
  name: string
}