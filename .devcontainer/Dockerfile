# Node image. Floating the patch inside the LTS line so rebuilds pick up security
# fixes; the major is pinned so every rebuild runs the same Node as the last one.
FROM node:24-bookworm

# Add default packages

RUN npm install -g npm-check-updates
