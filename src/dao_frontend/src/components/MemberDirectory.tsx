import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Search, UserCheck, Clock, TrendingUp, Shield, Loader2, ExternalLink, Globe, Award, Coins, Calendar, UserX, ArrowUpDown, Crown, ShieldCheck, User } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { useActors } from '../context/ActorContext';
import { useAuth } from '../context/AuthContext';

interface MemberProfile {
  id: Principal;
  role: string;  // "Creator", "Admin", "Member", etc.
  displayName: string;
  bio: string;
  website: string;
  joinedAt: number;
  reputation: number;
  totalStaked: number;
  votingPower: number;
  showProfile: boolean;  // Privacy flag
  showBio: boolean;      // Privacy flag
  showWebsite: boolean;  // Privacy flag
}

type SortField = 'displayName' | 'role' | 'reputation' | 'votingPower' | 'totalStaked' | 'joinedAt';
type SortDirection = 'asc' | 'desc';

// Role Badge Component
interface RoleBadgeProps {
  role: string;
  size?: 'sm' | 'md';
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const configs = {
    Creator: {
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      icon: Crown,
      tooltip: 'Founded the DAO. Has full governance rights and ultimate authority.',
    },
    Admin: {
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      icon: ShieldCheck,
      tooltip: 'Can create proposals, manage treasury, and moderate members.',
    },
    Member: {
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/30',
      textColor: 'text-gray-400',
      icon: User,
      tooltip: 'Can vote on proposals and stake tokens.',
    },
    Treasurer: {
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
      icon: Coins,
      tooltip: 'Manages DAO treasury and financial operations.',
    },
    Delegate: {
      color: 'from-orange-500 to-yellow-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      icon: UserCheck,
      tooltip: 'Votes on behalf of delegators.',
    },
  };

  const config = configs[role as keyof typeof configs] || configs.Member;
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div className="group relative inline-block">
      <div className={`inline-flex items-center gap-1.5 ${sizeClasses} ${config.bgColor} ${config.borderColor} border rounded-full ${config.textColor} font-medium`}>
        <Icon className={iconSize} />
        <span>{role}</span>
      </div>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-300 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-10 shadow-xl">
        {config.tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

const MemberDirectory: React.FC = () => {
  const { dao } = useOutletContext<{ dao: any }>();
  const daoId = dao?.id || '';
  const daoName = dao?.name || 'DAO';
  const actors = useActors();
  const { principal } = useAuth();
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('votingPower');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    loadMembers();
  }, [daoId]);

  const loadMembers = async () => {
    if (!actors?.daoBackend) return;
    
    setLoading(true);
    try {
      // Debug logging
      console.log('Loading members for DAO ID:', daoId);
      console.log('DAO object:', dao);
      
      // Try to get the registry DAO ID if available
      // Priority: dao_id (registry ID) > registryId > id
      let registryDaoId = dao?.dao_id || dao?.registryId || daoId;
      console.log('Attempting with registry DAO ID:', registryDaoId);
      
      // TEMPORARY FIX: Map known temp IDs to registry IDs
      // This should be removed once DAO creation properly stores registry IDs
      const idMapping: Record<string, string> = {
        'dao-1760630234914': 'dao_1', // Add your mapping here
      };
      
      if (idMapping[registryDaoId]) {
        console.log(`Mapping temp ID ${registryDaoId} to registry ID ${idMapping[registryDaoId]}`);
        registryDaoId = idMapping[registryDaoId];
      }
      
      // Get member profiles
      const profiles = await actors.daoBackend.getDAOMemberProfiles(registryDaoId);
      console.log('Received profiles:', profiles);
      
      setMembers(profiles as any);
      setMemberCount(profiles.length);
    } catch (error) {
      console.error('Failed to load members:', error);
      console.error('DAO ID used:', daoId);
      console.error('Full DAO object:', dao);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    const ms = timestamp > 9_999_999_999 ? Math.floor(timestamp / 1_000_000) : timestamp;
    return new Date(ms).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrincipal = (principalObj: Principal) => {
    const text = principalObj.toString();
    return `${text.slice(0, 8)}...${text.slice(-6)}`;
  };

  const isCurrentUser = (memberId: Principal) => {
    return principal && memberId.toString() === principal;
  };

  // Check if profile is private (using showProfile flag from backend)
  const isProfilePrivate = (member: MemberProfile) => {
    return !member.showProfile;
  };

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort Icon Component
  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return (
      <ArrowUpDown className={`w-4 h-4 text-cyan-400 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
    );
  };

  // Filter and sort members
  const filteredMembers = members
    .filter(member => {
      // Role filter
      if (roleFilter !== 'all' && member.role !== roleFilter) {
        return false;
      }
      
      // Search filter
      if (searchQuery === '') return true;
      const query = searchQuery.toLowerCase();
      return (
        member.displayName.toLowerCase().includes(query) ||
        member.id.toString().includes(query) ||
        member.bio.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'displayName':
          aValue = a.displayName || a.id.toString();
          bValue = b.displayName || b.id.toString();
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        
        case 'role':
          // Sort by role hierarchy: Creator > Admin > Member
          const roleOrder = { 'Creator': 0, 'Admin': 1, 'Treasurer': 2, 'Delegate': 3, 'Member': 4 };
          aValue = roleOrder[a.role as keyof typeof roleOrder] ?? 999;
          bValue = roleOrder[b.role as keyof typeof roleOrder] ?? 999;
          break;
        
        case 'reputation':
          aValue = Number(a.reputation);
          bValue = Number(b.reputation);
          break;
        
        case 'votingPower':
          aValue = Number(a.votingPower);
          bValue = Number(b.votingPower);
          break;
        
        case 'totalStaked':
          aValue = Number(a.totalStaked);
          bValue = Number(b.totalStaked);
          break;
        
        case 'joinedAt':
          aValue = Number(a.joinedAt);
          bValue = Number(b.joinedAt);
          break;
        
        default:
          return 0;
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Members</h2>
            <p className="text-gray-400 text-sm">
              {memberCount} total member{memberCount !== 1 ? 's' : ''} in {daoName}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 text-sm">
          <div className="bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-lg">
            <span className="text-cyan-400 font-semibold">{members.length}</span>
            <span className="text-gray-400 ml-1">Total</span>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-lg">
            <span className="text-green-400 font-semibold">
              {members.filter(m => !isProfilePrivate(m)).length}
            </span>
            <span className="text-gray-400 ml-1">Public</span>
          </div>
          {members.filter(m => isProfilePrivate(m)).length > 0 && (
            <div className="bg-purple-500/10 border border-purple-500/30 px-4 py-2 rounded-lg">
              <span className="text-purple-400 font-semibold">
                {members.filter(m => isProfilePrivate(m)).length}
              </span>
              <span className="text-gray-400 ml-1">Private</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, bio, role, or principal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400 font-medium">Filter by role:</span>
          {['all', 'Creator', 'Admin', 'Member', 'Treasurer', 'Delegate'].map((filter) => {
            const count = filter === 'all' 
              ? members.length 
              : members.filter(m => m.role === filter).length;
            
            if (filter !== 'all' && count === 0) return null;

            return (
              <button
                key={filter}
                onClick={() => setRoleFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  roleFilter === filter
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-gray-600'
                }`}
              >
                {filter === 'all' ? 'All' : filter}
                <span className="ml-1.5 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Privacy Notice */}
      {members.filter(m => isProfilePrivate(m)).length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 flex items-start gap-3"
        >
          <Shield className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-purple-400 font-medium mb-1">Privacy Respected</h4>
            <p className="text-gray-300 text-sm">
              Some members have chosen to keep their profile details private. 
              However, <strong>roles are always visible</strong> for governance transparency, 
              along with Principal ID, Reputation, Voting Power, and Total Staked.
            </p>
          </div>
        </motion.div>
      )}

      {/* Table */}
      {filteredMembers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 bg-gray-800/30 rounded-xl border border-gray-700"
        >
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Search className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No members found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? 'Try adjusting your search' : 'No members in this DAO yet'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Clear search
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-gray-700 rounded-xl overflow-hidden"
        >
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-gray-700">
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('displayName')}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors group"
                    >
                      Member
                      <SortIcon field="displayName" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('role')}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors group"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Role
                      <SortIcon field="role" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-semibold text-gray-300">Bio</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-semibold text-gray-300">Website</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-sm font-semibold text-gray-300">Principal</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('reputation')}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors group"
                    >
                      <Award className="w-4 h-4" />
                      Reputation
                      <SortIcon field="reputation" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('votingPower')}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors group"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Voting Power
                      <SortIcon field="votingPower" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('totalStaked')}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors group"
                    >
                      <Coins className="w-4 h-4" />
                      Total Staked
                      <SortIcon field="totalStaked" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('joinedAt')}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors group"
                    >
                      <Calendar className="w-4 h-4" />
                      Join Date
                      <SortIcon field="joinedAt" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, index) => {
                  const isPrivate = isProfilePrivate(member);
                  // Show "Anonymous Member" if no display name OR if profile is private
                  const isAnonymous = !member.displayName || member.displayName.trim() === '';
                  const displayName = isAnonymous ? 'Anonymous Member' : (isPrivate ? 'Anonymous Member' : member.displayName);
                  const showBio = !isPrivate && member.showBio && member.bio && member.bio.trim() !== '';
                  const showWebsite = !isPrivate && member.showWebsite && member.website && member.website.trim() !== '';
                  const isCurrent = isCurrentUser(member.id);

                  return (
                    <motion.tr
                      key={member.id.toString()}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`border-b border-gray-700/50 hover:bg-white/5 transition-colors ${
                        isCurrent ? 'bg-cyan-500/5' : ''
                      }`}
                    >
                      {/* Member Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isPrivate || isAnonymous
                              ? 'bg-gradient-to-br from-gray-500 to-gray-600' 
                              : 'bg-gradient-to-br from-cyan-400 to-purple-500'
                          }`}>
                            {isPrivate || isAnonymous ? (
                              <UserX className="w-5 h-5 text-white" />
                            ) : (
                              <span className="text-white font-bold text-sm">
                                {displayName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium">{displayName}</p>
                              {isCurrent && (
                                <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/50 rounded text-cyan-400 text-xs">
                                  You
                                </span>
                              )}
                            </div>
                            {(isPrivate || isAnonymous) && (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                <Shield className="w-3 h-3" />
                                {isAnonymous ? 'Profile not set' : 'Private'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role - Always visible (governance data) */}
                      <td className="px-6 py-4">
                        <RoleBadge role={member.role} />
                      </td>

                      {/* Bio */}
                      <td className="px-6 py-4">
                        {member.showBio && member.bio && member.bio.trim() !== '' ? (
                          <p className="text-gray-300 text-sm line-clamp-2 max-w-xs">
                            {member.bio}
                          </p>
                        ) : (
                          <span className="text-gray-500 text-sm italic">
                            {!member.showBio ? 'Hidden' : 'No bio'}
                          </span>
                        )}
                      </td>

                      {/* Website */}
                      <td className="px-6 py-4">
                        {member.showWebsite && member.website && member.website.trim() !== '' ? (
                          <a
                            href={member.website.startsWith('http') ? member.website : `https://${member.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                          >
                            <Globe className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate max-w-[150px]">
                              {member.website.replace(/^https?:\/\//, '')}
                            </span>
                          </a>
                        ) : (
                          <span className="text-gray-500 text-sm italic">
                            {!member.showWebsite ? 'Hidden' : '-'}
                          </span>
                        )}
                      </td>

                      {/* Principal */}
                      <td className="px-6 py-4">
                        <code className="text-gray-400 text-xs font-mono bg-white/5 px-2 py-1 rounded">
                          {formatPrincipal(member.id)}
                        </code>
                      </td>

                      {/* Reputation */}
                      <td className="px-6 py-4">
                        <span className="text-yellow-400 font-semibold">
                          {Number(member.reputation).toLocaleString()}
                        </span>
                      </td>

                      {/* Voting Power */}
                      <td className="px-6 py-4">
                        <span className="text-purple-400 font-semibold">
                          {Number(member.votingPower).toLocaleString()}
                        </span>
                      </td>

                      {/* Total Staked */}
                      <td className="px-6 py-4">
                        <span className="text-green-400 font-semibold">
                          {Number(member.totalStaked).toLocaleString()}
                        </span>
                      </td>

                      {/* Join Date */}
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">
                          {formatDate(Number(member.joinedAt))}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MemberDirectory;
