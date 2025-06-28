import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Users, TrendingUp, Star, CheckCircle, Gamepad2, Coins, Rocket, Globe, Lock, Sparkles, ChevronDown } from 'lucide-react';

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'Built on Internet Computer with full transparency and security',
      color: 'from-cyan-400 to-blue-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant transactions and real-time updates',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Governed by the community, for the community',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: TrendingUp,
      title: 'High Growth Potential',
      description: 'Access to vetted, high-potential projects',
      color: 'from-purple-400 to-pink-500'
    }
  ];

  const stats = [
    { label: 'Total Value Locked', value: '$125M+', icon: Coins },
    { label: 'Active Projects', value: '150+', icon: Rocket },
    { label: 'Community Members', value: '50K+', icon: Users },
    { label: 'Success Rate', value: '85%', icon: TrendingUp }
  ];

  const projects = [
    {
      name: 'DeFi Protocol X',
      description: 'Revolutionary lending protocol',
      raised: '$2.5M',
      target: '$5M',
      participants: 1234,
      status: 'Live',
      progress: 50
    },
    {
      name: 'NFT Marketplace Y',
      description: 'Next-gen NFT trading platform',
      raised: '$1.8M',
      target: '$3M',
      participants: 856,
      status: 'Live',
      progress: 60
    },
    {
      name: 'Gaming DAO Z',
      description: 'Community-owned gaming ecosystem',
      raised: '$4.2M',
      target: '$6M',
      participants: 2341,
      status: 'Upcoming',
      progress: 70
    }
  ];

  const heroSlides = [
    {
      title: "DAOVERSE",
      subtitle: "THE FUTURE OF DECENTRALIZED FINANCE",
      description: "Join the most advanced DAO platform powered by Internet Computer"
    },
    {
      title: "INVEST SMART",
      subtitle: "VETTED PROJECTS, MAXIMUM RETURNS",
      description: "Access high-potential projects curated by our expert community"
    },
    {
      title: "GOVERN TOGETHER",
      subtitle: "YOUR VOICE, YOUR POWER",
      description: "Participate in governance and shape the future of DeFi"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
            {[...Array(400)].map((_, i) => (
              <div key={i} className="border border-cyan-500/20"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Dynamic Hero Content */}
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8 }}
            className="relative mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-4 relative">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                {heroSlides[currentSlide].title}
              </span>
            </h1>
            
            <div className="font-mono text-xl md:text-2xl text-cyan-400 mb-8">
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                >
              </motion.span>
              {" "}{heroSlides[currentSlide].subtitle}
            </div>
          </motion.div>

          <motion.p
            key={`desc-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            {heroSlides[currentSlide].description}
          </motion.p>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2 mb-12">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-cyan-400 scale-125' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          {/* Enhanced CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <Link
              to="/dashboard"
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 flex items-center">
                <Rocket className="mr-2 w-5 h-5" />
                ENTER DAOVERSE
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Link>
            
            <Link
              to="/signin"
              className="group px-8 py-4 border-2 border-cyan-400 text-cyan-400 rounded-lg font-bold text-lg transition-all duration-300 hover:bg-cyan-400 hover:text-black hover:scale-105 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                <Shield className="mr-2 w-5 h-5" />
                CONNECT IDENTITY
              </span>
              <div className="absolute inset-0 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
          </motion.div>

          {/* Enhanced Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-gray-900/50 border border-cyan-500/30 rounded-lg p-6 backdrop-blur-sm relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <stat.icon className="w-8 h-8 text-cyan-400 mx-auto mb-2 relative z-10" />
                <div className="text-2xl font-bold text-white mb-1 relative z-10">{stat.value}</div>
                <div className="text-sm text-gray-400 font-mono relative z-10">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <ChevronDown className="w-6 h-6 text-cyan-400" />
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-cyan-400 mr-2" />
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
                  POWER-UPS
                </span>
              </h2>
              <Sparkles className="w-8 h-8 text-purple-400 ml-2" />
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-mono">
              > Experience the next generation of decentralized investment platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="group relative bg-gray-900/80 border border-gray-700/50 rounded-lg p-8 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-mono relative z-10">
                  {feature.title}
                </h3>
                <p className="text-gray-200 relative z-10 leading-relaxed">{feature.description}</p>
                
                {/* Animated border */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-cyan-400/20 to-purple-500/20 bg-clip-border"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Featured Projects */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-purple-400 mr-2" />
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                  FEATURED QUESTS
                </span>
              </h2>
              <Star className="w-8 h-8 text-pink-400 ml-2" />
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-mono">
              > Discover high-potential projects vetted by our community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group bg-gray-900/50 border border-purple-500/30 rounded-lg p-6 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300 relative overflow-hidden"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="text-xl font-bold text-white font-mono">
                    {project.name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    project.status === 'Live' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {project.status}
                  </span>
                </div>
                
                <p className="text-gray-400 mb-4 relative z-10">{project.description}</p>
                
                <div className="space-y-3 mb-4 relative z-10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-mono">PROGRESS</span>
                    <span className="font-bold text-cyan-400">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    ></motion.div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                    <div>
                      <p className="text-gray-500">RAISED</p>
                      <p className="font-bold text-green-400">{project.raised}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">TARGET</p>
                      <p className="font-bold text-white">{project.target}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm font-mono">
                    <span className="text-gray-500">PLAYERS</span>
                    <span className="font-bold text-purple-400">{project.participants.toLocaleString()}</span>
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border border-cyan-500/30 rounded-2xl p-12 backdrop-blur-sm relative overflow-hidden"
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-cyan-400 mr-2" />
                <h2 className="text-4xl md:text-5xl font-bold text-white font-mono">
                  READY TO{' '}
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
                    LEVEL UP?
                  </span>
                </h2>
                <Sparkles className="w-8 h-8 text-purple-400 ml-2" />
              </div>
              <p className="text-xl text-gray-300 mb-8 font-mono">
                > Connect your Internet Identity and start your DeFi adventure today.
              </p>
              <Link
                to="/signin"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-lg rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Rocket className="mr-2 w-5 h-5 relative z-10" />
                <span className="relative z-10">START MISSION</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;