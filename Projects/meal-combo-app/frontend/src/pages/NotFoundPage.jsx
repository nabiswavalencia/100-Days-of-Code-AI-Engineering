import { Link } from 'react-router'
import { Wordmark } from './LoginPage.jsx'

export default function NotFoundPage() {
  return (
    <main id="main" className="mx-auto grid min-h-dvh max-w-xl content-center gap-5 px-4">
      <Wordmark />
      <h1 className="t-h1">This Page Isn&rsquo;t on the Menu</h1>
      <p className="text-muted">The link may be old or mistyped. Head back and pick a restaurant.</p>
      <Link to="/restaurants" className="btn btn-primary justify-self-start">
        See All Restaurants
      </Link>
    </main>
  )
}
