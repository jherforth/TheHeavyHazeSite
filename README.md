# The Heavy Haze

Website for The Heavy Haze, a stoner doom project. It's a static site with no build step: open `index.html` or host it on GitHub Pages.

## Structure
- `index.html`: page content (sections: Gospel/about, Hymnal/music, Pilgrimage/shows, Relics/gallery, Confession/contact)
- `css/style.css`: styles; the colour palette lives in `:root` at the top
- `js/main.js`: rose window, drifting smoke, scroll reveal, mobile menu
- `assets/`: favicon; put photos in `assets/img/`

## To fill in
- Tracklist, Bandcamp/Spotify links (`#hymnal`)
- Show dates: copy the `<li class="show">` block (`#pilgrimage`)
- Gallery: replace the SVG placeholders in `.relic` figures with `<img src="assets/img/...">`
- Contact email (`mailto:booking@example.com`)
