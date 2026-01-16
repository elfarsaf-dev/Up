# Auto Compress & Upload

## Overview
A simple static web application for automatic image compression and file upload. Users can select images or PDF files, which are automatically compressed (if images) and uploaded to a remote API.

## Project Structure
- `index.html` - Single-page application with embedded CSS and JavaScript
- `package.json` - Node.js package configuration for the serve dependency

## Features
- Automatic image compression using browser-image-compression library
- Multi-file upload support
- Supports images and PDF files
- Upload results displayed as direct links

## Development
The project runs as a static site served on port 5000 using the `serve` package.

## Deployment
Configured for static deployment, serving files from the root directory.
