
# DAO Platform - Decentralized Investment & Governance

[![Internet Computer](https://img.shields.io/badge/Internet%20Computer-Protocol-29ABE2?style=flat-square)](https://internetcomputer.org/)
[![Motoko](https://img.shields.io/badge/Backend-Motoko-8A2BE2?style=flat-square)](https://github.com/dfinity/motoko)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=flat-square)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Build%20Tool-Vite-646CFF?style=flat-square)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?style=flat-square)](https://tailwindcss.com/)

A comprehensive decentralized autonomous organization (DAO) platform built on the Internet Computer blockchain, featuring secure governance, staking mechanisms, treasury management, and a modern React frontend with Internet Identity authentication.

## 🌟 Features

### Core Functionality
- **🔐 Internet Identity Authentication**: Secure, passwordless authentication using IC's native identity system
- **🏛️ DAO Governance**: Proposal creation, voting mechanisms, and community-driven decision making
- **💰 Staking System**: Token staking with rewards and voting power calculation
- **🏦 Treasury Management**: Decentralized fund management and allocation
- **📊 Investment Dashboard**: Real-time portfolio tracking and project analytics
- **🚀 DAO Launcher**: Create and deploy new DAOs with customizable parameters

### Frontend Features
- **⚡ Real-time Updates**: Instant transaction feedback and live data
- **📱 Responsive Design**: Mobile-first design with desktop optimization
- **🎨 Modern UI/UX**: Gradient animations, particle effects, and smooth transitions
- **🔍 Advanced Filtering**: Search and filter projects by category, status, and more
- **📈 Interactive Charts**: Visual portfolio performance and analytics
- **🌐 Multi-language Support**: Extensible internationalization framework

## 🏗️ Architecture

### Backend (Motoko)
```
src/dao_backend/
├── main.mo                 # Main DAO actor and coordinator
├── governance/             # Voting and proposal management
│   └── main.mo
├── staking/               # Token staking and rewards
│   └── main.mo
├── treasury/              # Fund management and allocation
│   └── main.mo
├── proposals/             # Proposal lifecycle management
│   └── main.mo
└── shared/                # Common types and utilities
    └── types.mo
```

### Frontend (React + Vite)
```
src/dao_frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Dashboard.jsx     # Main dashboard
│   │   ├── LandingPage.jsx   # Home page
│   │   ├── SignIn.jsx        # Authentication
│   │   ├── LaunchDAO.jsx     # DAO creation wizard
│   │   ├── Settings.jsx      # User preferences
│   │   └── Navbar.jsx        # Navigation component
│   ├── context/           # React context providers
│   │   └── AuthContext.jsx   # Authentication state
│   ├── declarations/      # Auto-generated canister interfaces
│   └── App.jsx           # Main application component
├── public/               # Static assets
└── package.json         # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 7.0.0 or higher
- **DFX**: Internet Computer SDK (latest version)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd dao
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd src/dao_frontend
   npm install
   cd ../..
   ```

### Development Setup

1. **Start the local Internet Computer replica:**
   ```bash
   dfx start --background --clean
   ```

2. **Deploy the canisters:**
   ```bash
   dfx deploy
   ```

3. **Start the frontend development server:**
   ```bash
   npm start
   ```

4. **Access the application:**
   - Frontend: `http://localhost:3000`
   - Candid UI: `http://localhost:4943/?canisterId={canister_id}`

### Alternative Development Commands

```bash
# Generate canister declarations
dfx generate

# Deploy specific canister
dfx deploy dao_backend

# Build frontend only
npm run build

# Run frontend in development mode
cd src/dao_frontend && npm run dev

# Format frontend code
cd src/dao_frontend && npm run format
```

## 📦 Project Structure

### Core Modules

1. **DAO Backend (`dao_backend`)**
   - Main coordinator for all DAO operations
   - User profile management
   - Cross-module communication

2. **Governance Module (`governance`)**
   - Proposal creation and management
   - Voting mechanisms (weighted and simple)
   - Execution of approved proposals

3. **Staking Module (`staking`)**
   - Token staking and unstaking
   - Reward calculation and distribution
   - Voting power based on stakes

4. **Treasury Module (`treasury`)**
   - Fund allocation and management
   - Multi-signature operations
   - Budget tracking and reporting

5. **Proposals Module (`proposals`)**
   - Proposal lifecycle management
   - Category-based organization
   - Timeline and status tracking

### Frontend Components

- **Landing Page**: Marketing site with feature showcase
- **Dashboard**: Main user interface for portfolio management
- **Authentication**: Internet Identity integration
- **DAO Launcher**: Multi-step DAO creation wizard
- **Settings**: User preferences and profile management

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
DFX_NETWORK=local
VITE_CANISTER_ID_DAO_BACKEND=your_canister_id
VITE_CANISTER_ID_GOVERNANCE=your_canister_id
VITE_CANISTER_ID_STAKING=your_canister_id
VITE_CANISTER_ID_TREASURY=your_canister_id
VITE_CANISTER_ID_PROPOSALS=your_canister_id
```

### DFX Configuration

The `dfx.json` file is pre-configured with:
- 5 backend canisters (dao_backend, governance, staking, treasury, proposals)
- Frontend asset canister with workspace support
- Internet Identity integration

### Frontend Configuration

Key configuration files:
- `vite.config.js`: Build tool configuration
- `tailwind.config.js`: Styling framework setup
- `postcss.config.js`: CSS processing
- `tsconfig.json`: TypeScript configuration

## 🛠️ Development Workflow

### Backend Development

1. **Modify Motoko files** in `src/dao_backend/`
2. **Deploy changes:**
   ```bash
   dfx deploy dao_backend
   ```
3. **Generate new declarations:**
   ```bash
   dfx generate
   ```

### Frontend Development

1. **Start development server:**
   ```bash
   cd src/dao_frontend
   npm run dev
   ```
2. **Access live reload** at `http://localhost:3000`
3. **Build for production:**
   ```bash
   npm run build
   ```

### Testing

```bash
# Run all tests
npm test

# Run frontend tests only
cd src/dao_frontend && npm test

# Run backend tests
dfx test
```

## 🔐 Security Features

- **Internet Identity**: Passwordless authentication with biometric support
- **Canister Security**: Role-based access control and permission management
- **Secure Storage**: Encrypted user data and private key management
- **Multi-signature**: Treasury operations require multiple approvals
- **Audit Trail**: Complete transaction and governance history

## 📚 Key Technologies

### Backend Stack
- **Motoko**: Smart contract programming language
- **Internet Computer**: Blockchain platform and runtime
- **Candid**: Interface description language

### Frontend Stack
- **React 18**: User interface library with hooks
- **Vite**: Fast build tool and development server
- **TailwindCSS**: Utility-first CSS framework
- **Framer Motion**: Animation and gesture library
- **Lucide React**: Modern icon library

### Development Tools
- **DFX**: Internet Computer development framework
- **TypeScript**: Type-safe JavaScript development
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing and optimization

## 🚀 Deployment

### Local Deployment
```bash
dfx start --background
dfx deploy
```

### IC Mainnet Deployment
```bash
dfx deploy --network ic --with-cycles 1000000000000
```

### Frontend Hosting
The frontend can be deployed to:
- IC Asset Canister (recommended)
- Vercel, Netlify, or similar platforms
- Custom web servers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📖 Documentation

### Internet Computer Resources
- [IC Developer Portal](https://internetcomputer.org/docs/current/developer-docs/setup/deploy-locally)
- [Motoko Programming Language Guide](https://internetcomputer.org/docs/current/motoko/main/motoko)
- [Internet Identity Documentation](https://internetcomputer.org/docs/current/tokenomics/identity-auth/what-is-ic-identity)

### Framework Documentation
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Vite Documentation](https://vitejs.dev/guide/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🐛 Troubleshooting

### Common Issues

1. **DFX Start Fails**
   ```bash
   dfx stop
   dfx start --clean --background
   ```

2. **Canister Build Errors**
   ```bash
   dfx canister delete --all
   dfx deploy
   ```

3. **Frontend Build Issues**
   ```bash
   cd src/dao_frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Authentication Problems**
   - Clear browser cache and cookies
   - Try incognito/private browsing mode
   - Check Internet Identity service status

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Internet Computer Foundation for the blockchain platform
- DFINITY team for Motoko and development tools
- React and Vite communities for excellent development experience
- Open source contributors and the broader Web3 community

---

**Built with ❤️ on the Internet Computer**


hi

