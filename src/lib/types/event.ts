interface Location {
  address: string;
  link_to_maps: string | null;
}

interface Source {
  name: string;
  link: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  start_date_time: string;
  end_date_time: string;
  is_public_holiday: boolean;
  is_optional_holiday: boolean;
  location: Location;
  image: string | null;
  source: Source;
  labels: string[];
}

type View = 'Year' | 'Month' | 'Week' | 'Day';

export type { Location, Source, Event, View };
