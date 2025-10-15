# DAOVerse - DAO Launcher Kit

[![Internet Computer](https://img.shields.io/badge/Internet%20Computer-Protocol-29ABE2?style=flat-square)](https://internetcomputer.org/)
[![Motoko](https://img.shields.io/badge/Backend-Motoko-8A2BE2?style=flat-square)](https://github.com/dfinity/motoko)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=flat-square)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Build%20Tool-Vite-646CFF?style=flat-square)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?style=flat-square)](https://tailwindcss.com/)

A comprehensive DAO (Decentralized Autonomous Organization) creation and management platform built on the Internet Computer blockchain. Create, deploy, and manage DAOs with advanced governance systems, treasury management, and staking mechanisms, now featuring a dedicated ICRC-1 ledger for native token accounting and treasury synchronization.

## 🌐 Live Deployment

**DAOVerse is now live on IC Mainnet!**

🚀 **Frontend Application**: https://7e7p4-jyaaa-aaaao-a4pba-cai.icp0.io/

### Mainnet Canister Links

#### **Frontend Interface**
- **🎯 DAOVerse Application**: https://7e7p4-jyaaa-aaaao-a4pba-cai.icp0.io/
- **🔐 Internet Identity**: https://7wzyf-fiaaa-aaaao-a4pca-cai.icp0.io/

#### **Backend Candid Interfaces**
- **🏛️ DAO Backend**: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=7k5cu-siaaa-aaaao-a4paa-cai
- **🗳️ Governance**: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=7d6ji-eaaaa-aaaao-a4pbq-cai
- **📈 Staking**: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=6suxx-4iaaa-aaaao-a4pea-cai
- **💰 Treasury**: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=6vvrd-rqaaa-aaaao-a4peq-cai
- **📋 Proposals**: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=772tz-taaaa-aaaao-a4pdq-cai
- **📁 Assets**: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=uulqk-jaaaa-aaaao-a4o7q-cai
- **🔍 DAO Registry**: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=5mfqz-3yaaa-aaaao-a4pna-cai
- **📊 DAO Analytics**: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=5fg3f-nqaaa-aaaao-a4pmq-cai
- **🪙 ICRC1 Ledger**: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=zpwzl-tiaaa-aaaao-a4pwa-cai

### Mainnet Canister IDs
```
DAO Backend:     7k5cu-siaaa-aaaao-a4paa-cai
Frontend:        7e7p4-jyaaa-aaaao-a4pba-cai
Governance:      7d6ji-eaaaa-aaaao-a4pbq-cai
Staking:         6suxx-4iaaa-aaaao-a4pea-cai
Treasury:        6vvrd-rqaaa-aaaao-a4peq-cai
Proposals:       772tz-taaaa-aaaao-a4pdq-cai
Assets:          uulqk-jaaaa-aaaao-a4o7q-cai
DAO Registry:    5mfqz-3yaaa-aaaao-a4pna-cai
DAO Analytics:   5fg3f-nqaaa-aaaao-a4pmq-cai
ICRC1 Ledger:    zpwzl-tiaaa-aaaao-a4pwa-cai
Internet Identity: 7wzyf-fiaaa-aaaao-a4pca-cai
```

> 🎯 **Quick Start**: Visit [https://7e7p4-jyaaa-aaaao-a4pba-cai.icp0.io/](https://7e7p4-jyaaa-aaaao-a4pba-cai.icp0.io/) to start using DAOVerse immediately!

> 📖 **For Developers**: Follow the [Quick Start](#quick-start) section below to deploy your own instance.
## Key Features

### Core DAO Components
- **Governance System**: Comprehensive proposal creation, voting, and execution with configurable parameters
- **Treasury Management**: Secure multi-signature treasury operations and fund management
- **Staking Mechanism**: Flexible token staking with customizable periods and reward structures
- **Asset Management**: Advanced asset handling and portfolio management
- **Proposal Framework**: Full lifecycle proposal management with various proposal types
- **ICRC1 Ledger Integration**: Dedicated ICRC-1 ledger canister powering token issuance, transfers, and DAO-wide accounting

### Discovery & Analytics
- **DAO Explorer**: Global registry to discover and join DAOs created by other users
- **Platform Metrics**: Real-time analytics dashboard showing ecosystem health and growth
- **Search & Filtering**: Advanced filters by category, size, activity, and creation date
- **Trending DAOs**: Dynamic leaderboard of most active and engaging DAOs

### Advanced Features
- **DAO Dashboard**: Complete overview of DAO metrics, member activity, and performance
- **User Registration**: Streamlined onboarding and member management
- **Settings Management**: Comprehensive configuration options for DAO customization
- **Internet Identity Integration**: Secure, passwordless authentication
- **Real-time Status Monitoring**: Live updates on DAO operations and member activities

### User Experience
- **Modern Interface**: Clean, responsive design built with React 18 and TailwindCSS
- **Real-time Updates**: Instant feedback on all transactions and governance actions
- **Mobile Responsive**: Optimized experience across desktop and mobile devices
- **Interactive Animations**: Smooth transitions and engaging user interactions with Framer Motion

## Technical Architecture

### Backend Canister Structure
```
src/dao_backend/
├── main.mo               # Main DAO coordinator and entry point
├── dao_registry/         # Global DAO discovery system
│   └── main.mo           # Registry for cross-DAO exploration
├── analytics/            # Platform metrics and insights
│   └── main.mo           # Event tracking and analytics
├── governance/           # Voting and proposal management system
│   ├── main.mo           # Governance canister logic
│   └── main.test.mo      # Unit tests for governance
├── staking/              # Token staking and rewards
│   └── main.mo           # Staking mechanism implementation
├── treasury/             # Multi-signature fund management
│   └── main.mo           # Treasury operations and security
├── proposals/            # Proposal lifecycle management
│   └── main.mo           # Proposal creation and execution
├── assets/               # Asset management and storage
│   ├── main.mo           # Asset handling logic
│   └── main.test.mo      # Asset management tests
└── shared/               # Common types and utilities
    └── types.mo          # Shared data structures

third_party/icrc1/            # ICRC1 Token Standard Implementation
├── ic-icrc1-ledger.wasm.gz   # Pre-built ICRC1 ledger canister
└── ledger.did                # ICRC1 ledger interface definition
```

**ICRC1 Ledger Addition:** The kit now ships with a dedicated ICRC1 ledger canister managing native token balances across governance, treasury, and staking modules.

### Frontend Application Structure
```
src/dao_frontend/
├── src/
│   ├── components/                 # React UI components
│   │   ├── DAODashboard.tsx        # Main dashboard interface
│   │   ├── DAOManagement.tsx       # DAO creation and management
│   │   ├── ExplorePage.tsx         # DAO discovery and exploration
│   │   ├── MetricsDashboard.tsx    # Platform analytics dashboard
│   │   ├── Governance.jsx          # Voting and proposal interface
│   │   ├── Treasury.jsx            # Treasury management UI
│   │   ├── Staking.jsx             # Staking interface
│   │   ├── Assets.jsx              # Asset management
│   │   ├── Settings.jsx            # Configuration and preferences
│   │   └── modals/                 # Modal dialogs and popups
│   ├── hooks/                      # Custom React hooks
│   │   ├── useDAODiscovery.ts      # DAO exploration functionality
│   │   └── useAnalytics.ts         # Platform metrics integration
│   ├── context/                    # React context providers
│   ├── utils/                      # Utility functions
│   ├── config/                     # Configuration and setup
│   │   └── agent.ts                # Internet Computer agent setup
│   └── declarations/               # Generated canister interfaces
├── public/                         # Static assets and resources
└── dist/                           # Built frontend files
```

### Canister Dependencies
```
dao_backend             ← Core coordinator
├── dao_registry        ← Global DAO discovery system
├── dao_analytics       ← Platform metrics and tracking
├── governance          ← Depends on dao_backend, staking
├── staking             ← Independent base canister
├── treasury            ← Independent treasury operations
├── proposals           ← Proposal management
├── assets              ← Asset storage and management
├── icrc1_ledger        ← ICRC1 token standard implementation
└── internet_identity   ← Authentication provider
```

## Quick Start

### Prerequisites
- **Node.js**: Version 16.0.0 or higher
- **DFX**: Internet Computer SDK (latest version)
- **Git**: For version control
- **NPM**: Version 7.0.0 or higher

### Installation and Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rxshil09/DAO_launcher_kit.git
   cd DAOVerse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd src/dao_frontend && npm install && cd ../..
   ```

3. **Start the Internet Computer replica:**
   ```bash
   dfx start --clean --background
   ```

4. **Deploy all canisters using the deployment script:**
   ```bash
   ./deploy.sh
   ```
   
   This script will:
   - Deploy all backend canisters (dao_backend, governance, staking, treasury, proposals, assets)
   - Deploy Internet Identity for authentication
   - Generate type declarations
   - Build and deploy the frontend
   - Update environment variables

5. **Start the development server:**
   ```bash
   cd src/dao_frontend && npm run dev
   ```

6. **Access the application:**
   - **Frontend**: http://localhost:5173
   - **Candid UI**: http://localhost:4943/?canisterId={canister_id}

### Alternative Deployment Options


**Environment variable management:**
```bash
./update-env.sh  # Updates .env files with current canister IDs
```

**Individual canister deployment:**
```bash
# Deploy specific canisters
dfx deploy dao_backend
dfx deploy governance --argument "(principal \"$(dfx canister id dao_backend)\", principal \"$(dfx canister id staking)\")"
```

## Development

### Environment Configuration

The project supports multiple environment configurations:

**Local Development** (`.env.local`):
```env
VITE_CANISTER_ID_DAO_BACKEND=uxrrr-q7777-77774-qaaaq-cai
VITE_CANISTER_ID_GOVERNANCE=umunu-kh777-77774-qaaca-cai
VITE_CANISTER_ID_STAKING=uzt4z-lp777-77774-qaabq-cai
VITE_CANISTER_ID_TREASURY=ulvla-h7777-77774-qaacq-cai
VITE_CANISTER_ID_PROPOSALS=ucwa4-rx777-77774-qaada-cai
VITE_CANISTER_ID_ASSETS=ufxgi-4p777-77774-qaadq-cai
VITE_CANISTER_ID_INTERNET_IDENTITY=vizcg-th777-77774-qaaea-cai
VITE_HOST=http://127.0.0.1:4943
VITE_DFX_NETWORK=local
```

**Mainnet Production** (`.env.production`):
```env
# Mainnet Production Configuration
VITE_CANISTER_ID_DAO_BACKEND=7k5cu-siaaa-aaaao-a4paa-cai
VITE_CANISTER_ID_GOVERNANCE=7d6ji-eaaaa-aaaao-a4pbq-cai
VITE_CANISTER_ID_STAKING=6suxx-4iaaa-aaaao-a4pea-cai
VITE_CANISTER_ID_TREASURY=6vvrd-rqaaa-aaaao-a4peq-cai
VITE_CANISTER_ID_PROPOSALS=772tz-taaaa-aaaao-a4pdq-cai
VITE_CANISTER_ID_ASSETS=uulqk-jaaaa-aaaao-a4o7q-cai
VITE_CANISTER_ID_DAO_REGISTRY=5mfqz-3yaaa-aaaao-a4pna-cai
VITE_CANISTER_ID_DAO_ANALYTICS=5fg3f-nqaaa-aaaao-a4pmq-cai
VITE_CANISTER_ID_ICRC1_LEDGER=zpwzl-tiaaa-aaaao-a4pwa-cai
VITE_CANISTER_ID_INTERNET_IDENTITY=7wzyf-fiaaa-aaaao-a4pca-cai
VITE_HOST=https://icp0.io
VITE_DFX_NETWORK=ic
VITE_IC_HOST=https://icp0.io
VITE_NODE_ENV=production
VITE_BUILD_MODE=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

### Essential Development Commands

```bash
# Backend Development
dfx start --clean --background    # Start local IC replica
dfx deploy                        # Deploy all canisters
dfx deploy dao_backend           # Deploy specific canister
dfx generate                     # Generate type declarations
dfx canister status dao_backend  # Check canister status

# Frontend Development
cd src/dao_frontend
npm run dev                      # Start development server (port 5173)
npm run build                    # Build for production
npm run format                   # Format code with Prettier
npm test                         # Run tests

# Deployment Scripts
./deploy.sh                      # Local development deployment
./deploy-mainnet.sh              # Mainnet production deployment  
./update-frontend.sh             # Update frontend only (mainnet)
./update-env.sh                  # Update environment variables
```

### Configuration Files

Key configuration files in the project:
- `dfx.json`: Internet Computer project configuration with canister definitions
- `package.json`: Root workspace configuration and scripts
- `src/dao_frontend/package.json`: Frontend dependencies and build scripts
- `vite.config.js`: Build tool configuration
- `tailwind.config.js`: Styling framework setup
- `postcss.config.js`: CSS processing
- `tsconfig.json`: TypeScript configuration

## Security Features

- **Internet Identity**: Passwordless authentication with biometric support
- **Canister Security**: Role-based access control and permission management
- **Secure Storage**: Encrypted user data and private key management
- **Multi-signature**: Treasury operations require multiple approvals
- **Audit Trail**: Complete transaction and governance history

## Technology Stack

### Backend Technologies
- **Motoko**: Smart contract programming language optimized for the Internet Computer
- **Internet Computer Protocol**: Blockchain platform providing scalable and secure computation
- **Candid**: Interface description language for service interfaces
- **Multi-canister Architecture**: Modular design with specialized canisters for different functions

### Frontend Technologies
- **React 18**: Modern UI library with concurrent features and hooks
- **Vite**: Lightning-fast build tool and development server
- **TailwindCSS**: Utility-first CSS framework for rapid UI development
- **Framer Motion**: Production-ready animation and gesture library
- **Lucide React**: Beautiful and customizable icon library
- **React Router DOM**: Declarative routing for React applications

### Development and Build Tools
- **DFX**: Internet Computer development framework and CLI
- **TypeScript**: Type-safe JavaScript with enhanced developer experience
- **ESLint**: Code linting and style enforcement
- **PostCSS**: CSS processing with modern plugin ecosystem
- **Prettier**: Code formatting for consistent style
- **Vitest**: Fast and lightweight testing framework

## Deployment

### 🚀 Mainnet Deployment (Production)

**DAOVerse is already deployed and running on IC Mainnet!**

To deploy your own instance to mainnet:

```bash
# Prerequisites: Ensure you have sufficient cycles (minimum 3.5T cycles)
# Create and fund a mainnet identity
dfx identity new mainnet_deploy
dfx identity use mainnet_deploy

# Fund your canister (you'll need to transfer cycles)
# Visit: https://faucet.dfinity.org/ for testnet cycles
# For mainnet: https://nns.ic0.app/ to manage cycles

# Use the comprehensive mainnet deployment script
./deploy-mainnet.sh
```

The `deploy-mainnet.sh` script will:
- ✅ Check cycles balance and identity
- ✅ Deploy all backend canisters in correct order
- ✅ Update environment variables with deployed canister IDs
- ✅ Build frontend with production configuration
- ✅ Deploy frontend canister
- ✅ Provide all access URLs and canister IDs

**Alternative: Manual Mainnet Deployment**
```bash
# Deploy backend canisters first
dfx deploy dao_backend --network ic
dfx deploy staking --network ic
dfx deploy treasury --network ic
dfx deploy proposals --network ic
dfx deploy assets --network ic

# Deploy governance with proper arguments
dfx deploy governance --network ic --argument "(principal \"$(dfx canister id dao_backend --network ic)\", principal \"$(dfx canister id staking --network ic)\")"

# Update environment variables and build frontend
cd src/dao_frontend
# Update .env.production with deployed canister IDs
NODE_ENV=production npm run build -- --mode production

# Deploy frontend
cd ../..
dfx deploy dao_frontend --network ic
```

### 🔧 Local Development Deployment
```bash
# Full local setup using the deployment script
./deploy.sh

# Manual deployment steps
dfx start --clean --background
dfx deploy dao_backend
dfx deploy staking  
dfx deploy governance --argument "(principal \"$(dfx canister id dao_backend)\", principal \"$(dfx canister id staking)\")"
dfx deploy treasury
dfx deploy proposals
dfx deploy assets
dfx deploy dao_frontend
```


### 🌐 Frontend Update Only (For Mainnet)

If you need to update only the frontend on an existing mainnet deployment:

```bash
# Use the frontend update script
./update-frontend.sh
```

This script will:
- ✅ Read existing canister IDs from deployment
- ✅ Update environment variables 
- ✅ Rebuild frontend with production settings
- ✅ Deploy updated frontend to mainnet

### Environment Management
```bash
# Update environment variables after deployment
./update-env.sh

# Manual environment variable setup for different networks
cp .env.development .env.local     # For local development
cp .env.production .env.playground # For playground deployment
```

## Contributing

We welcome contributions to DAOVerse! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -am 'Add: description of your feature'`
5. Push to the branch: `git push origin feature/your-feature-name`
6. Submit a Pull Request with a clear description

### Development Guidelines
- Follow the existing code style and conventions
- Write tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting

### Areas for Contribution
- Frontend UI/UX improvements
- Backend Motoko development
- Documentation and tutorials
- Testing and bug fixes
- Security audits and improvements

## Documentation and Resources

### Project Documentation
- **[Developer Guide](./docs/DEVELOPER_GUIDE.md)** - Comprehensive development workflow and best practices
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete API reference and examples
- **[User Guides](./docs/USER_GUIDES.md)** - End-user instructions and tutorials

### Internet Computer Resources
- [IC Developer Portal](https://internetcomputer.org/docs/current/developer-docs/setup/deploy-locally)
- [Motoko Programming Language Guide](https://internetcomputer.org/docs/current/motoko/main/motoko)
- [Internet Identity Documentation](https://internetcomputer.org/docs/current/tokenomics/identity-auth/what-is-ic-identity)
- [Candid Interface Language](https://internetcomputer.org/docs/current/developer-docs/backend/candid/)

### Framework Documentation
- [React 18 Documentation](https://reactjs.org/docs/getting-started.html)
- [Vite Build Tool](https://vitejs.dev/guide/)
- [TailwindCSS Framework](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

## Troubleshooting

### Common Development Issues

**DFX and Replica Issues:**
```bash
# Replica won't start
dfx stop
dfx start --clean --background

# Canister deployment fails
dfx canister delete --all
dfx deploy

# Clear all local state
rm -rf .dfx
dfx start --clean --background
```

**Frontend Build Issues:**
```bash
# Node modules conflicts
cd src/dao_frontend
rm -rf node_modules package-lock.json
npm install

# Environment variables not loaded
source .env.local
npm run dev

# Type declaration issues
dfx generate
npm run build
```

**Authentication and Connection Issues:**
- Clear browser cache and cookies
- Try incognito/private browsing mode
- Verify Internet Identity service is running
- Check canister IDs in environment variables
- Ensure local replica is running on correct port

**Deployment Issues:**
```bash
# Check canister status (local)
dfx canister status dao_backend

# Check canister status (mainnet)
dfx canister status dao_backend --network ic

# Verify canister IDs
dfx canister id --all
dfx canister id --all --network ic

# Update environment variables
./update-env.sh

# Redeploy frontend only (mainnet)
./update-frontend.sh

# Full mainnet redeployment
./deploy-mainnet.sh
```

**Mainnet-Specific Issues:**
```bash
# Check cycles balance
dfx cycles balance --network ic

# Check identity
dfx identity whoami
dfx identity list

# Verify canister controllers
dfx canister info dao_frontend --network ic

# Update frontend with correct environment
cd src/dao_frontend
NODE_ENV=production npm run build -- --mode production
cd ../..
dfx deploy dao_frontend --network ic
```

### Getting Help
- Check the [Issues](https://github.com/rxshil09/DAO_launcher_kit/issues) section
- Review the comprehensive [Developer Guide](./docs/DEVELOPER_GUIDE.md)
- Join the Internet Computer developer community

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **DFINITY Foundation** for the Internet Computer platform and infrastructure
- **React and Vite communities** for excellent development tools and documentation
- **TailwindCSS team** for the utility-first CSS framework
- **Motoko development team** for the smart contract programming language
- **All contributors and community members** who help improve DAOVerse

---

**DAOVerse** - Democratizing DAO creation on the Internet Computer

🌐 **Live on IC Mainnet**: [https://7e7p4-jyaaa-aaaao-a4pba-cai.icp0.io/](https://7e7p4-jyaaa-aaaao-a4pba-cai.icp0.io/)



