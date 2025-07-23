# Profound Platform Clone

An AI visibility analytics platform that tracks brand presence across AI search engines like ChatGPT, Perplexity, Google AI Overviews, and Microsoft Copilot.

![Next.js](https://img.shields.io/badge/Next.js-15.4.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## 🚀 Features

### ✅ Completed (Phases 1-7)

- **🔐 Authentication & User Management** - Complete user authentication with role-based access control
- **📊 Overview Dashboard** - Main analytics dashboard with key metrics and insights
- **⚡ Answer Engine Insights** - Detailed visibility tracking across AI platforms
- **🎯 Prompt Management** - Advanced prompt designer with templates and scheduling
- **🏢 Data Management** - Complete CRUD operations for brands, topics, and prompts
- **🔗 Citations System** - Comprehensive citation tracking and analysis
  - Citation share statistics and breakdown
  - Domain analysis with ranking and filtering
  - Page-level citation performance
  - Interactive network visualization

### 🚧 In Development (Phases 8-12)

- **📈 Platform Analytics** - Individual platform performance views
- **🎬 Actions & Recommendations** - AI-powered optimization suggestions
- **🤖 Agent Analytics** - Bot detection and conversation tracking
- **📋 Data Export & Reporting** - Comprehensive reporting system
- **⚙️ Background Jobs** - Automated data collection and processing

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI primitives
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Charts**: Recharts
- **State Management**: Zustand
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/xinghanchen001/profound-platform.git
   cd profound-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   ```bash
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🗂️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Main application pages
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard-specific components
│   ├── insights/         # Analytics components
│   ├── citations/        # Citation system components
│   ├── prompts/          # Prompt management
│   └── brands/           # Brand management
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── database/         # Database service layers
│   ├── supabase/         # Supabase client
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
└── styles/               # Global styles
```

## 🎯 Key Components

### Citations System
- **CitationOverview**: Citation share statistics and type breakdown
- **DomainAnalysis**: Domain ranking table with sorting and platform breakdown
- **PageAnalysis**: Page-level citation performance with pagination
- **CitationNetwork**: Interactive 2D network visualization

### Analytics Components
- **VisibilityInsights**: Platform-specific visibility tracking
- **SentimentInsights**: Sentiment analysis across AI platforms
- **PromptsInsights**: Prompt execution history and performance
- **PlatformsInsights**: Individual platform analytics

### Management Systems
- **PromptDesigner**: Template-based prompt creation with AI generation
- **BrandManagement**: Brand portfolio management
- **TopicManagement**: Topic organization and categorization

## 🔧 Development

### Database Schema
The application uses Supabase with a comprehensive schema including:
- User management and authentication
- Organization and role-based access control
- Brand and topic management
- Prompt execution tracking
- Citation analysis and aggregation
- Analytics and reporting tables

### API Layer
Service layers provide type-safe database operations:
- `promptService` - Prompt CRUD operations
- `brandService` - Brand management
- `topicService` - Topic organization
- `citationService` - Citation analytics
- `analyticsService` - Performance metrics

### UI/UX
- Responsive design with mobile-first approach
- Dark theme optimized for analytics
- Interactive data visualizations
- Comprehensive filtering and search
- Real-time updates and notifications

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

## 📊 Database Migrations

The project includes comprehensive database migrations:
- `001_initial_schema.sql` - Core tables and relationships
- `002_prompt_management.sql` - Prompt execution system
- `003_analytics_tables.sql` - Analytics and citation tracking
- `004_row_level_security.sql` - Security policies

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control (Owner, Admin, Member, Viewer)
- Environment variable protection
- Input validation and sanitization
- Authentication middleware protection

## 📈 Performance

- **Page Load**: < 3 seconds target
- **API Response**: < 500ms target
- **Database Queries**: < 100ms target
- **Lighthouse Score**: > 90 target

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database and auth by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Note**: This is a clone/implementation of the Profound platform for educational and demonstration purposes. The original Profound platform is a commercial product.
