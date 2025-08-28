# AgriNexus AI Documentation

This directory contains comprehensive documentation for the AgriNexus AI Agricultural Management Platform.

## 📖 Available Documentation

- **[index.md](index.md)** - Main documentation homepage
- **[user-account-types.md](user-account-types.md)** - Complete guide to user roles and permissions

## 🌐 GitHub Pages Deployment

This documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch.

### Accessing the Documentation
Once deployed, the documentation will be available at:
- `https://[username].github.io/agri-nexus-ai/` (for project pages)
- `https://[username].github.io/` (for user/organization pages)

### Local Development

To run the documentation locally using Jekyll:

```bash
# Install Jekyll and dependencies
gem install bundler jekyll

# Navigate to docs directory
cd docs

# Install dependencies
bundle install

# Serve locally
bundle exec jekyll serve
```

The site will be available at `http://localhost:4000`

## 📁 File Structure

```
docs/
├── _config.yml          # Jekyll configuration
├── index.md             # Homepage
├── user-account-types.md # User roles documentation
└── README.md           # This file
```

## 🔧 Configuration

### Jekyll Configuration
The `_config.yml` file contains the Jekyll configuration for GitHub Pages deployment, including:
- Site metadata
- Theme settings
- Plugin configuration
- Navigation structure

### GitHub Pages Workflow
The `.github/workflows/deploy-pages.yml` file handles automatic deployment to GitHub Pages when changes are pushed to the main branch.

## ✅ GitHub Pages Setup

### Prerequisites
1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Ensure the workflow file is present in `.github/workflows/`

### Deployment Process
1. Push changes to the main branch
2. GitHub Actions automatically builds the site
3. Built site is deployed to GitHub Pages
4. Documentation is accessible via the GitHub Pages URL

## 🚀 Adding New Documentation

To add new documentation pages:

1. Create a new Markdown file in the `docs/` directory
2. Add front matter at the top of the file:
   ```yaml
   ---
   title: Page Title
   description: Page description
   ---
   ```
3. Write your content in Markdown format
4. Update the navigation in `_config.yml` if needed
5. Commit and push to trigger deployment

## 📝 Markdown Guidelines

- Use proper heading hierarchy (# ## ### ####)
- Include a table of contents for long documents
- Use code blocks with language specification
- Add descriptive alt text for images
- Use relative links between documentation pages

## 🎨 Styling

The documentation uses the default Jekyll Minima theme. Custom styling can be added by:
1. Creating a `_sass` directory
2. Adding custom SCSS files
3. Updating `_config.yml` to include the custom styles

---

*For questions about the documentation system, please contact the development team.*