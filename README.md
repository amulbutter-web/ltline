# Smart LT Lines Break Detection & Automatic Isolation System

An AI-powered web platform for detecting LT line breaks, monitoring grid conditions, supporting automatic fault isolation, and providing an LLM-powered grid assistant.

## Overview

This project demonstrates a smart distribution-grid monitoring and fault-management concept through an interactive web dashboard.

### Key Features

- Real-time LT line monitoring dashboard
- Line-break/fault detection visualization
- Automatic isolation workflow simulation
- Analytics and event monitoring
- Grid architecture visualization
- AI-powered assistant ("Bolt") for grid-related questions
- Netlify serverless backend for AI requests
- Responsive web interface

## Technology Stack

- HTML5
- CSS3
- JavaScript
- Netlify Functions
- Groq API / LLM
- Lucide Icons
- Google Fonts

## Project Structure

```text
.
├── css/
│   ├── design-system.css
│   └── style.css
├── js/
│   ├── main.js
│   └── shared.js
├── netlify/
│   └── functions/
│       └── chat.js
├── index.html
├── about.html
├── analytics.html
├── applications.html
├── architecture.html
├── contact.html
├── documentation.html
├── events.html
├── monitoring.html
├── technology.html
├── netlify.toml
├── .env.example
└── .gitignore
```

## Running Locally

For the static frontend, open the project through a local development server rather than directly using `file://`.

If you only need to preview the frontend, any simple local HTTP server or editor live-preview feature can be used.

The AI assistant requires the Netlify Function and a configured Groq API key.

## Environment Variable

The backend expects:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Never commit a real API key to GitHub.

For Netlify deployment, configure `GROQ_API_KEY` in the site's environment variables.

## Deployment

The project includes `netlify.toml` and a Netlify Function at:

```text
netlify/functions/chat.js
```

The frontend communicates with the AI backend through:

```text
/api/chat
```

## Live Demo

https://ltline.netlify.app/

## Project Status

This is a hackathon project / working prototype intended to demonstrate the concept, interface, system workflow, and AI integration. Some grid measurements and operational values shown in the interface may represent simulated or prototype data rather than field-validated measurements.

## Security Note

Keep all API credentials in environment variables. Do not place secret keys inside frontend HTML or JavaScript files.

## License

No open-source license is currently specified. See the repository owner/organizer's intended usage terms before reusing the project.
