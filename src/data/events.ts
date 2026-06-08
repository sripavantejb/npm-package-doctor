import { EVENT_IMAGES } from '../features/darshan/data/images'

export type EventType = 'upcoming' | 'special-puja' | 'current' | 'live'

export type EventItem = {
  id: string
  name: string
  location: string
  date: string
  time: string
  attendees: string
  type: EventType
  imageUrl: string
  imageAlt: string
  hasSpecialEntry?: boolean
  month: number
}

export const EVENTS: EventItem[] = [
  {
    id: 'e1',
    name: 'Brahmotsavam — Garuda Seva',
    location: 'Tirumala, Andhra Pradesh',
    date: '14 Jun 2026',
    time: '6:00 AM – 12:00 PM',
    attendees: '2L+ expected',
    type: 'upcoming',
    imageUrl: EVENT_IMAGES.e1.url,
    imageAlt: EVENT_IMAGES.e1.alt,
    hasSpecialEntry: true,
    month: 6,
  },
  {
    id: 'e2',
    name: 'Vaikunta Ekadasi Special Entry',
    location: 'Tirumala, Andhra Pradesh',
    date: '10 Jan 2027',
    time: '4:00 AM – 12:00 PM',
    attendees: '28k+ expected',
    type: 'special-puja',
    imageUrl: EVENT_IMAGES.e2.url,
    imageAlt: EVENT_IMAGES.e2.alt,
    hasSpecialEntry: true,
    month: 1,
  },
  {
    id: 'e3',
    name: 'Weekly Sarva Darshan — Tirumala',
    location: 'Tirumala, Andhra Pradesh',
    date: 'Every Sunday',
    time: '5:00 AM onwards',
    attendees: '12k+ expected',
    type: 'current',
    imageUrl: EVENT_IMAGES.e3.url,
    imageAlt: EVENT_IMAGES.e3.alt,
    month: 0,
  },
  {
    id: 'e4',
    name: 'Ganga Aarti — Dashashwamedh Ghat',
    location: 'Varanasi, Uttar Pradesh',
    date: 'Daily',
    time: '6:00 PM – 7:00 PM',
    attendees: '5k+ expected',
    type: 'live',
    imageUrl: EVENT_IMAGES.e4.url,
    imageAlt: EVENT_IMAGES.e4.alt,
    month: 0,
  },
  {
    id: 'e5',
    name: 'Guru Purnima at Shirdi',
    location: 'Shirdi, Maharashtra',
    date: '26 Jul 2026',
    time: '4:00 AM – 10:00 PM',
    attendees: '80k+ expected',
    type: 'upcoming',
    imageUrl: EVENT_IMAGES.e5.url,
    imageAlt: EVENT_IMAGES.e5.alt,
    hasSpecialEntry: true,
    month: 7,
  },
  {
    id: 'e6',
    name: 'Rath Yatra — Jagannath Temple',
    location: 'Puri, Odisha',
    date: '16 Jul 2026',
    time: '10:00 AM – 6:00 PM',
    attendees: '1L+ expected',
    type: 'special-puja',
    imageUrl: EVENT_IMAGES.e6.url,
    imageAlt: EVENT_IMAGES.e6.alt,
    month: 7,
  },
]

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  upcoming: 'Upcoming',
  'special-puja': 'Special Puja',
  current: 'Current',
  live: 'Live',
}

export const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const
