import React from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { 
  Image, 
  Upload, 
  Download,
  Folder,
  File,
  Video,
  Music,
  Archive
} from 'lucide-react';
import { DAO } from '../../types/dao';

const ManagementAssets: React.FC = () => {
  const { dao } = useOutletContext<{ dao: DAO }>();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 font-mono">ASSETS</h2>
          <p className="text-gray-400">
            Manage digital assets and files for {dao.name}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all font-semibold"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Asset</span>
        </motion.button>
      </div>

      {/* Placeholder Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 text-center"
      >
        <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2 font-mono">ASSET MANAGEMENT</h3>
        <p className="text-gray-400 mb-6">
          This section will contain comprehensive asset management functionality
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 border border-blue-500/30 p-4 rounded-lg">
            <Image className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-blue-400 font-mono text-sm">Images</p>
          </div>
          <div className="bg-gray-900/50 border border-green-500/30 p-4 rounded-lg">
            <Video className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 font-mono text-sm">Videos</p>
          </div>
          <div className="bg-gray-900/50 border border-purple-500/30 p-4 rounded-lg">
            <File className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-purple-400 font-mono text-sm">Documents</p>
          </div>
          <div className="bg-gray-900/50 border border-orange-500/30 p-4 rounded-lg">
            <Archive className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-orange-400 font-mono text-sm">Archives</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ManagementAssets;