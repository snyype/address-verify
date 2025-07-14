# Address Validator

A modern web application for validating and searching Australian addresses, built with Next.js, GraphQL, Google Maps API, and Elasticsearch.

## Features

- 🔍 **Address Verification**: Validate Australian addresses with real-time feedback
- 🗺️ **Interactive Maps**: Google Maps integration for visual address verification
- 📊 **Activity Logging**: Track verification and search activities
- 🎨 **Modern UI**: Beautiful, responsive interface built with Tailwind CSS and Radix UI
- ⚡ **Real-time**: GraphQL-powered real-time data updates
- 📱 **Mobile Responsive**: Optimized for all device sizes

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **pnpm** (recommended)
- **Git**

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Google Maps API (Required for map functionality)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Base URL (Optional - defaults to localhost:3000)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Authentication Token (Optional)
AUTH_TOKEN=your_auth_token_here

# Elasticsearch API Key (Optional)
ELASTICSEARCH_API_KEY=your_elasticsearch_api_key_here

# Analytics (Optional)
ENABLE_ANALYTICS=true

# Debug Mode (Optional)
DEBUG=true

# Port (Optional - defaults to 3000)
PORT=3000
```

### Getting Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**
4. Go to **Credentials** and create an **API Key**
5. Add the API key to your `.env.local` file

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd adresmain
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install
   
   # Or using pnpm (recommended)
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Edit the file with your actual values
   # See Environment Variables section above
   ```

## Running the Application

### Development Mode

```bash
# Using npm
npm run dev

# Or using pnpm
pnpm dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible UI components
- **GraphQL** - Data querying
- **Apollo Client** - GraphQL client
- **Google Maps API** - Map functionality
- **Elasticsearch** - Search and logging
- **Lucide React** - Icons

## Troubleshooting

### Common Issues

1. **Google Maps not loading**
   - Ensure you have a valid Google Maps API key
   - Check that the Maps JavaScript API is enabled in Google Cloud Console

2. **Build errors**
   - Clear the `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

3. **Environment variables not working**
   - Ensure your `.env.local` file is in the root directory
   - Restart the development server after adding environment variables

4. **Port already in use**
   - Change the port in your `.env.local` file: `PORT=3001`
   - Or kill the process using the port: `npx kill-port 3000`

### Development Tips

- Use the browser's developer tools to check for console errors
- The application includes debug logging - check the console for helpful messages
- GraphQL queries and mutations are defined in `lib/graphqlmutation.ts`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository or contact the maintainer.

---

Built with 💙 by [Aashish](https://github.com/snyype) 