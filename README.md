# Ikso AfriFabs

> Premium African fabrics e-commerce platform with 3D visualization

[![Deployment Status](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://ikso-afri-fabs.vercel.app)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://ikso-afri-fabs.vercel.app)

**🌐 Live Demo:** [https://ikso-afri-fabs.vercel.app](https://ikso-afri-fabs.vercel.app)

An elegant web application for browsing and purchasing authentic African fabrics featuring Ankara, Kente, Adire, and Aso-Oke styles. Built with modern web technologies and powered by Supabase.

## ✨ Features

- 🎨 **Interactive Gallery** - Browse premium African fabrics with filtering and search
- 🖼️ **3D Studio** - Visualize fabrics on different models (dress, shirt, cushion, tote) using Three.js
- 💱 **Multi-Currency** - Support for NGN (Nigerian Naira) and CFA (West African CFA)
- 📱 **WhatsApp Integration** - Direct ordering via WhatsApp
- 🛒 **Shopping Cart** - Persistent cart functionality
- 🔐 **User Accounts** - Save designs, favorites, and order history

## 🛠️ Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **3D Rendering:** Three.js + React Three Fiber
- **Backend:** Supabase (PostgreSQL + Authentication + Storage)
- **Animations:** Framer Motion
- **State Management:** TanStack Query

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/ikechukwupjoel1/Ikso-AfriFabs.git

# Navigate to project directory
cd Ikso-AfriFabs

# Install dependencies
npm install

# Create .env file with your Supabase credentials
# See .env.example for required variables

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 📦 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

See [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) for detailed Supabase configuration instructions.

## 🗄️ Database Setup

The project includes SQL migration scripts in the `supabase/` folder:

1. `01-create-tables.sql` - Database schema
2. `02-create-policies.sql` - Row Level Security policies
3. `03-create-indexes.sql` - Performance indexes
4. `04-seed-data.sql` - Sample fabric data

Run these scripts in your Supabase SQL Editor in order. See [`supabase/README.md`](./supabase/README.md) for details.

## 📜 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🏗️ Project Structure

```
Ikso-AfriFabs/
├── src/
│   ├── components/      # React components
│   │   ├── fabric/      # Fabric-related components
│   │   ├── home/        # Home page components
│   │   ├── layout/      # Layout components (Header, Footer)
│   │   └── ui/          # shadcn/ui components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions & Supabase client
│   ├── pages/           # Page components
│   ├── types/           # TypeScript type definitions
│   └── data/            # Static data (temp - will be replaced by Supabase)
├── supabase/            # SQL migration scripts
└── public/              # Static assets
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
4. Deploy!

### Netlify

1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables
5. Deploy!

### Other Platforms

The build output is in the `dist/` folder after running `npm run build`. You can deploy this to any static hosting service.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 📧 Contact

For inquiries, please contact via WhatsApp: [+234-801-234-5678](https://wa.me/2348012345678)

---

**Ikso AfriFabs** - Celebrating African Culture Through Premium Fabrics 🌍
