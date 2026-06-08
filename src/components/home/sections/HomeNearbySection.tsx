import { Link } from 'react-router-dom'
import { HUB_IMAGES } from '../../../features/darshan/data/images'
import { HomeSectionHeader } from './HomeSectionHeader'

const NEARBY_DESTINATIONS = [
  {
    id: 'n1',
    name: 'Tirupati',
    subtitle: '12 temples within 100 km',
    image: HUB_IMAGES.tirupati,
  },
  {
    id: 'n2',
    name: 'Shirdi',
    subtitle: '6 temples within 50 km',
    image: HUB_IMAGES.shirdi,
  },
  {
    id: 'n3',
    name: 'Varanasi',
    subtitle: '18 temples within 200 km',
    image: HUB_IMAGES.varanasi,
  },
] as const

export function HomeNearbySection() {
  return (
    <section className="pt-home-section pt-home-section--white" aria-labelledby="home-nearby-heading">
      <div className="pt-home-section__inner">
        <HomeSectionHeader
          title="Nearby Temples"
          subtitle="Explore sacred sites close to popular pilgrimage hubs"
          seeAllHref="/nearby"
          seeAllLabel="See all"
        />
        <div className="pt-home-hScroll pt-home-hScroll--fade" id="home-nearby-heading">
          {NEARBY_DESTINATIONS.map((d) => (
            <Link key={d.id} to="/nearby" className="pt-home-miniCard">
              <img src={d.image} alt={d.name} loading="lazy" />
              <div className="pt-home-miniCard__body">
                <p className="pt-home-miniCard__title">{d.name}</p>
                <p className="pt-home-miniCard__sub">{d.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
