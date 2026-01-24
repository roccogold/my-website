# Rocco Goldschmidt - Portfolio Website

A modern, responsive personal portfolio website showcasing projects, work experience, photography, and more. Built with vanilla HTML, CSS, and JavaScript, featuring PWA support and integrated APIs.

 👾 **Live Site:** [www.roccogold.com](https://www.roccogold.com)

## ✨ Features

- **Responsive Design** - Fully responsive layout optimized for all devices
- **Progressive Web App (PWA)** - Installable with offline support via service worker
- **Project Showcase** - Interactive display of professional projects and work experience
- **Photography Gallery** - Curated photo collection with location-based filtering
- **Contact Form** - Integrated contact form with API endpoint
- **Dynamic Content** - Interactive content and animations
- **Dark/Light Theme** - Theme toggle with persistent user preference
- **Smooth Animations** - Scroll-triggered animations and typewriter effects
- **SEO Optimized** - Comprehensive meta tags, structured data, and Open Graph support
- **Performance Optimized** - Fast loading times with optimized assets and lazy loading

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **APIs:** 
  - Contact form handler
- **PWA:** Service Worker for offline functionality
- **Hosting:** GitHub Pages
- **Deployment:** Vercel (for API endpoints)

## 📁 Project Structure

```
proj-portfolio/
├── api/                    # API endpoints
│   └── contact.js         # Contact form handler
├── assets/                # Static assets
│   ├── photos/            # Photography gallery images
│   ├── favicon files      # PWA icons and favicons
│   └── logos/             # Company and brand logos
├── index.html             # Main HTML file
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
├── package.json           # Project dependencies
├── CNAME                  # Custom domain configuration
└── 404.html              # Custom 404 page
```

## 🚀 Getting Started

### Prerequisites

- Node.js (for local development with Vercel)
- A modern web browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/roccogold/my-website.git
cd my-website
```

2. Install dependencies (if using Vercel for local development):
```bash
npm install
```

3. For local development with API endpoints:
```bash
npm run dev
```

4. For static hosting, simply serve the `index.html` file using any static file server.

## 📡 API Endpoints

The website includes a serverless API endpoint (configured for Vercel):

- **`/api/contact`** - POST endpoint for contact form submissions

## 🎨 Website Sections

1. **Hero/About** - Introduction and main call-to-action
2. **Work** - Professional experience at Moody's Analytics and Bitpanda
3. **Projects** - Showcase of key projects and achievements
4. **Thesis** - Academic research and thesis work
5. **Vibes** - Spotify integration for current music
6. **Perspectives** - Photography gallery with location filters
7. **Interests** - Personal interests and skills
8. **Contact** - Contact form and social links

## 🔧 Customization

### Updating Content

- Edit `index.html` to modify website content
- Update `manifest.json` for PWA metadata
- Modify `sw.js` for service worker caching strategies

### Adding Photos

1. Add new photos to `assets/photos/`
2. Update the photos array in `index.html` with new image metadata

### Styling

All styles are embedded in `index.html`. Modify the `<style>` sections to customize the design.

## 📱 PWA Features

- **Installable** - Users can install the site as a standalone app
- **Offline Support** - Service worker caches assets for offline access
- **App Icons** - Multiple icon sizes for different devices
- **Theme Color** - Custom theme color for browser UI

## 🌐 Deployment

### GitHub Pages

The site is configured for GitHub Pages deployment:

1. Push to the `main` branch
2. GitHub Pages will automatically deploy
3. Custom domain configured via `CNAME` file

### Vercel

For API endpoints, deploy to Vercel:

1. Connect your GitHub repository to Vercel
2. Deploy

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Rocco Goldschmidt**

- Website: [www.roccogold.com](https://www.roccogold.com)
- LinkedIn: [roccogoldschmidt](https://www.linkedin.com/in/roccogoldschmidt/)
- GitHub: [@roccogold](https://github.com/roccogold)

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for typography

---

⭐ If you find this project interesting, feel free to star the repository!
