
# DAO Launcher Kit 🚀

[![Internet Computer](https://img.shields.io/badge/Internet%20Computer-Protocol-29ABE2?style=flat-square)](https://internetcomputer.org/)
[![Motoko](https://img.shields.io/badge/Backend-Motoko-8A2BE2?style=flat-square)](https://github.com/dfinity/motoko)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=flat-square)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Build%20Tool-Vite-646CFF?style=flat-square)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?style=flat-square)](https://tailwindcss.com/)

A modular DAO (Decentralized Autonomous Organization) creation and management platform built on the Internet Computer blockchain. Launch your own DAO with customizable governance, staking, and treasury management systems.

## 🌟 Features

### Core Components
- **🏛️ Governance System**: Create and vote on proposals with configurable parameters
- **💰 Treasury Management**: Multi-signature control over DAO funds
- **� Staking Mechanism**: Token staking with flexible periods and rewards
- **📊 Proposal Framework**: Advanced proposal lifecycle management
- **� Internet Identity**: Secure authentication and authorization

### User Experience
- **🎨 Modern UI**: Clean, responsive design with TailwindCSS
- **⚡ Real-time Updates**: Instant feedback on transactions and votes
- **📱 Mobile-First**: Optimized for both mobile and desktop
- **🌐 Cross-Platform**: Works on any modern browser

## 🏗️ Architecture

### Backend Structure
```
src/dao_backend/
├── main.mo                # Main DAO coordinator
├── governance/            # Voting system
├── staking/              # Token staking
├── treasury/             # Fund management
├── proposals/            # Proposal handling
└── shared/              # Common types
```

### Frontend Structure
```
src/dao_frontend/
├── src/
│   ├── components/      # UI components
│   ├── context/         # React contexts
│   ├── hooks/          # Custom hooks
│   └── declarations/    # Canister interfaces
└── public/             # Static assets
```
└── package.json         # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 16.0.0
- DFX (Internet Computer SDK)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tojo04/DAO_launcher_kit.git
   cd DAO_launcher_kit
   ```

2. Install dependencies:
   ```bash
   npm install
   cd src/dao_frontend && npm install
   ```

3. Start local Internet Computer replica:
   ```bash
   dfx start --clean --background
   ```

4. Deploy the canisters:
   ```bash
   dfx deploy
   ```

5. Start the frontend:
   ```bash
   cd src/dao_frontend && npm run dev
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

## � Development

### Environment Setup

Create a `.env` file in the frontend directory:
```env
VITE_CANISTER_ID_DAO_BACKEND=xxx
VITE_CANISTER_ID_GOVERNANCE=xxx
VITE_CANISTER_ID_STAKING=xxx
VITE_CANISTER_ID_TREASURY=xxx
VITE_CANISTER_ID_PROPOSALS=xxx
```

### Key Commands

```bash
# Development
dfx start --clean --background  # Start local replica
dfx deploy                      # Deploy all canisters
dfx deploy dao_backend         # Deploy specific canister

# Frontend
npm run dev                    # Start development server
npm run build                 # Build for production

# Testing
dfx test                      # Run backend tests
npm test                      # Run frontend tests
```

## 🔒 Security Features

- Principal-based authentication
- Role-based access control
- Multi-signature treasury operations
- Secure upgrade patterns
- Input validation and sanitization

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory (you can copy `.env.example`):

```env
DFX_NETWORK=local
VITE_CANISTER_ID_DAO_BACKEND=your_canister_id
VITE_CANISTER_ID_GOVERNANCE=your_canister_id
VITE_CANISTER_ID_STAKING=your_canister_id
VITE_CANISTER_ID_TREASURY=your_canister_id
VITE_CANISTER_ID_PROPOSALS=your_canister_id
VITE_CANISTER_ID_INTERNET_IDENTITY=your_canister_id
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

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- DFINITY Foundation for the Internet Computer
- React and Vite communities
- TailwindCSS team
- All contributors and supporters

---

Built with ❤️ on the Internet Computer


hi

