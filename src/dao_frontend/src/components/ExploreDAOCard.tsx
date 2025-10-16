import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowRight,
  Star,
  Activity,
  Shield,
  ExternalLink,
  Globe,
  Zap,
  Award,
  Clock,
} from "lucide-react";
import { DAOMetadata } from "../types/dao";
import { useLogoImage } from "../hooks/useLogoImage";

interface ExploreDAOCardProps {
  dao: DAOMetadata;
  index: number;
  onJoin: (dao: DAOMetadata) => void;
  isTrending?: boolean;
}

const ExploreDAOCard: React.FC<ExploreDAOCardProps> = ({
  dao,
  index,
  onJoin,
  isTrending = false,
}) => {
  // Pass both camelCase and snake_case + legacy logo; the hook will normalize
  const { imageUrl, handleImageError } = useLogoImage({
    logoType: (dao as any).logoType ?? (dao as any).logo_type,
    logoAssetId: (dao as any).logoAssetId ?? (dao as any).logo_asset_id,
    logoUrl: (dao as any).logoUrl ?? (dao as any).logo_url,
    legacyLogo: (dao as any).logo,
  });
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "defi":
        return "from-green-400 to-emerald-500";
      case "gaming":
        return "from-purple-400 to-pink-500";
      case "social":
        return "from-blue-400 to-cyan-500";
      case "nft":
        return "from-orange-400 to-red-500";
      case "infrastructure":
        return "from-gray-400 to-slate-500";
      case "investment":
        return "from-yellow-400 to-orange-500";
      case "community":
        return "from-pink-400 to-rose-500";
      case "education":
        return "from-indigo-400 to-purple-500";
      case "art":
        return "from-violet-400 to-purple-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "defi":
        return DollarSign;
      case "gaming":
        return Activity;
      case "social":
        return Users;
      case "nft":
        return Award;
      case "infrastructure":
        return Shield;
      case "investment":
        return TrendingUp;
      case "community":
        return Globe;
      case "education":
        return Star;
      case "art":
        return Zap;
      default:
        return Shield;
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A";
    const ms =
      timestamp > 9_999_999_999 ? Math.floor(timestamp / 1_000_000) : timestamp;
    return new Date(ms).toLocaleDateString();
  };

  const formatTVL = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const getActivityStatus = (lastActivity: number) => {
    const now = Date.now();
    const daysSinceActivity = (now - lastActivity) / (1000 * 60 * 60 * 24);

    if (daysSinceActivity < 1)
      return { status: "Very Active", color: "text-green-400" };
    if (daysSinceActivity < 7)
      return { status: "Active", color: "text-blue-400" };
    if (daysSinceActivity < 30)
      return { status: "Moderate", color: "text-yellow-400" };
    return { status: "Low Activity", color: "text-gray-400" };
  };

  const CategoryIcon = getCategoryIcon(dao.category);
  const activityStatus = getActivityStatus(dao.last_activity);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        scale: 1.02,
        y: -5,
        boxShadow: "0 25px 50px rgba(59, 130, 246, 0.15)",
      }}
      className="bg-gray-900/50 border border-gray-700/50 rounded-xl backdrop-blur-sm overflow-hidden hover:border-blue-400/50 transition-all group relative"
    >
      {/* Trending Badge */}
      {isTrending && (
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white text-xs font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>TRENDING</span>
          </div>
        </div>
      )}

      {/* Header with Logo and Category */}
      <div className="relative h-48 overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(
            dao.category
          )} opacity-20`}
        ></div>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={dao.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Failed to load DAO logo:", imageUrl);
              e.currentTarget.style.display = "none";
              handleImageError();
            }}
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${getCategoryColor(
              dao.category
            )} flex items-center justify-center`}
          >
            <CategoryIcon className="w-16 h-16 text-white/80" />
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/30 text-white border border-white/20 backdrop-blur-sm">
            {dao.category}
          </span>
        </div>

        {/* Activity Status */}
        <div className="absolute bottom-4 left-4">
          <div
            className={`flex items-center space-x-1 px-2 py-1 bg-black/30 backdrop-blur-sm rounded-full text-xs ${activityStatus.color}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${activityStatus.color.replace(
                "text-",
                "bg-"
              )}`}
            ></div>
            <span>{activityStatus.status}</span>
          </div>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* DAO Name and Token */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors truncate">
            {dao.name}
          </h3>
          {dao.token_symbol && (
            <span className="text-sm font-mono text-blue-400 bg-blue-500/20 px-2 py-1 rounded border border-blue-500/30">
              ${dao.token_symbol}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
          {dao.description}
        </p>

        {dao.website && (
          <a
            href={dao.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-cyan-500 hover:text-cyan-300 text-sm mb-4 transition-colors group/link"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="w-3 h-3 mr-1" />
            <span className="break-all">DAO Website</span>
          </a>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400 font-mono">MEMBERS</span>
            </div>
            <p className="text-lg font-bold text-white">
              {dao.member_count.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400 font-mono">TVL</span>
            </div>
            <p className="text-lg font-bold text-white">
              {formatTVL(dao.total_value_locked)}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-mono">Active Proposals</span>
            <span className="text-blue-400 font-bold">
              {dao.active_proposals}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-mono">Created</span>
            <span className="text-gray-300">
              {formatDate(dao.creation_date)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-mono">Creator</span>
            <span className="text-cyan-400 font-mono text-xs">
              {dao.creator_principal.slice(0, 8)}...
              {dao.creator_principal.slice(-6)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <motion.button
            onClick={() => onJoin(dao)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg transition-all font-semibold flex items-center justify-center space-x-2 group"
          >
            <span>Join DAO</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {dao.website && (
            <motion.a
              href={dao.website}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </motion.a>
          )}
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
    </motion.div>
  );
};

export default ExploreDAOCard;
