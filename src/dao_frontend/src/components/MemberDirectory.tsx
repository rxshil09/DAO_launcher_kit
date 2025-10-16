import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Search, UserCheck, Clock, TrendingUp, Shield, Loader2 } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { useActors } from '../context/ActorContext';
import { useAuth } from '../context/AuthContext';

interface UserProfile {
  id: Principal;
  displayName: string;
  bio: string;
  joinedAt: number;
  reputation: number;
  totalStaked: number;
  votingPower: number;
}

const MemberDirectory: React.FC = () => {
  const { dao } = useOutletContext<{ dao: any }>();
  const daoId = dao?.id || '';
  const daoName = dao?.name || 'DAO';
  const actors = useActors();
  const { principal } = useAuth();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'reputation' | 'voting_power'>('newest');

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

  // Filter and sort members
  const filteredMembers = members
    .filter(member => {
      if (searchQuery === '') return true;
      const query = searchQuery.toLowerCase();
      return (
        member.displayName.toLowerCase().includes(query) ||
        member.id.toString().includes(query) ||
        member.bio.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return Number(b.joinedAt) - Number(a.joinedAt);
        case 'oldest':
          return Number(a.joinedAt) - Number(b.joinedAt);
        case 'reputation':
          return Number(b.reputation) - Number(a.reputation);
        case 'voting_power':
          return Number(b.votingPower) - Number(a.votingPower);
        default:
          return 0;
      }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-cyan-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Members</h2>
            <p className="text-gray-400 text-sm">
              {memberCount} {memberCount === 1 ? 'member' : 'members'} in {daoName}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search members by name, principal, or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="reputation">Highest Reputation</option>
            <option value="voting_power">Highest Voting Power</option>
          </select>
        </div>
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">
            {searchQuery ? 'No members found matching your search.' : 'No members yet.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-gray-800/50 border rounded-xl p-6 hover:border-cyan-500/50 transition-all ${
                isCurrentUser(member.id) ? 'border-cyan-500/50 ring-2 ring-cyan-500/20' : 'border-gray-700'
              }`}
            >
              {/* Member Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {member.displayName || 'Anonymous Member'}
                    </h3>
                    {isCurrentUser(member.id) && (
                      <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/50 rounded text-cyan-400 text-xs flex-shrink-0">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-mono truncate">
                    {formatPrincipal(member.id)}
                  </p>
                </div>
                
                {/* Member icon/avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Bio */}
              {member.bio && (
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {member.bio}
                </p>
              )}

              {/* Stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Joined
                  </span>
                  <span className="text-white">{formatDate(Number(member.joinedAt))}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Reputation
                  </span>
                  <span className="text-cyan-400 font-semibold">{Number(member.reputation)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    Voting Power
                  </span>
                  <span className="text-purple-400 font-semibold">
                    {Number(member.votingPower).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberDirectory;
