# Happy Flower

![Happy Flower](public/lovable-uploads/e7ebc54a-3544-46fa-888c-a469076505c8.png)

## Overview

Happy Flower is an innovative e-commerce platform that combines artificial intelligence with floral design. This application allows customers to describe their ideal flower arrangement using natural language, which is then transformed into a visual representation using AI image generation. Users can also browse traditional flower arrangements and place orders directly through the platform.

## Features

### For Customers

- **AI-Powered Flower Design**: Describe your ideal flower arrangement in natural language and get an AI-generated image
- **Order Management**: Place, track, and manage orders
- **Intelligent Chat Assistant**: Get personalized flower recommendations and answers to common questions
- **User Authentication**: Secure login and account management

### For Administrators

- **Order Management**: View, update status, and set prices for customer orders
- **Product Management**: Add, edit, and remove products from the catalog
- **AI Image Approval**: Review and approve/reject AI-generated flower designs
- **AI Training**: Add training data to improve the AI assistant's responses

## Technology Stack

- **Frontend**: React with vite.js
- **Styling**: Tailwind CSS with Shadcn UI components
- **Backend**: Supabase for database, authentication, and storage
- **AI Integration**: Sonar API and runware Api image


## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/happyflower.git
   cd bloom-ai-bouquets
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

### Database Setup

The project uses Supabase as its backend. To set up the necessary tables:

1. Create a new Supabase project
2. Run the SQL migrations in the `supabase/migrations` folder
3. Set up the following tables:
   - products
   - orders
   - generated_images
   - ai_training_data
   - user_roles
   - notifications

## Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── ui/             # Reusable UI components
│   │   └── ...             # Feature-specific components
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # Third-party service integrations
│   │   └── supabase/       # Supabase client configuration
│   ├── lib/                # Utility functions
│   ├── pages/              # Next.js pages
│   ├── styles/             # CSS styles
│   └── types/              # TypeScript type definitions
├── supabase/
│   ├── functions/          # Edge Functions
│   └── migrations/         # Database migrations
└── ...
```

## Key Components

### AI Chat

The AI chat interface allows users to interact with the AI assistant using natural language. The assistant can provide flower recommendations, answer questions about products, and help with order inquiries.

### Admin Panel

The Admin Panel provides a comprehensive interface for administrators to manage:
- Orders: View, update status, and set prices for orders
- Products: Add, edit, and manage the product catalog
- Generated Images: Review and approve/reject AI-generated flower designs
- AI Training: Add training data to improve the AI assistant's responses

### Order Flow

1. User describes their desired flower arrangement
2. AI generates an image based on the description
3. User submits order with the generated image
4. Admin reviews the order and sets a final price
5. User confirms the order
6. Admin processes the order and marks it as completed

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Vite.js](https://vite.dev/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
