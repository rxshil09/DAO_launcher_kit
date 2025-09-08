
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { Upload, Download, File } from 'lucide-react';
import { useAssets } from '../../hooks/useAssets';
import { DAO } from '../../types/dao';
// @ts-ignore - AuthContext is a .jsx file, ignore TypeScript error
import { useAuth } from '../../context/AuthContext';

const ManagementAssets: React.FC = () => {
  const { dao } = useOutletContext<{ dao: DAO }>();
  const { identity } = useAuth();

  const { getUserAssets, getPublicAssets, uploadAsset, getAsset, addAuthorizedUploader, getAuthorizedUploaders } = useAssets();
  const [assets, setAssets] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [authorizedUploaders, setAuthorizedUploaders] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkAndSetupAuthorization = async () => {
    try {
      console.log('🔐 Checking authorization...');
      const uploaders = await getAuthorizedUploaders();
      console.log('👥 Current authorized uploaders:', uploaders);
      setAuthorizedUploaders(uploaders);
      
      if (uploaders.length === 0) {
        console.log('⚡ No authorized uploaders found, attempting to authorize current user...');
        
        if (!identity) {
          console.error('❌ No identity available for authorization');
          return;
        }
        
        try {
          // Get the user's principal and add them as authorized uploader
          const userPrincipal = identity.getPrincipal().toText();
          console.log('� Adding user principal as authorized uploader:', userPrincipal);
          
          await addAuthorizedUploader(userPrincipal);
          const newUploaders = await getAuthorizedUploaders();
          console.log('✅ Authorization successful, new uploaders:', newUploaders);
          setAuthorizedUploaders(newUploaders);
        } catch (authError) {
          console.error('❌ Failed to authorize user:', authError);
        }
      }
    } catch (err) {
      console.error('❌ Authorization check failed:', err);
    }
  };

  const fetchAssets = async () => {
    try {
      console.log('🔍 Fetching assets...');
      const [userAssets, publicAssets] = await Promise.all([
        getUserAssets(),
        getPublicAssets(),
      ]);
      console.log('📁 User assets:', userAssets);
      console.log('🌐 Public assets:', publicAssets);
      
      // Handle potential null responses from mock actors
      const safeUserAssets = userAssets || [];
      const safePublicAssets = publicAssets || [];
      
      const userIds = new Set(safeUserAssets.map((a: any) => Number(a.id)));
      const combined = [
        ...safeUserAssets,
        ...safePublicAssets.filter((a: any) => !userIds.has(Number(a.id))),
      ];
      console.log('📋 Combined assets:', combined);
      setAssets(combined);

    } catch (err) {
      console.error('❌ Error fetching assets:', err);
      // Set empty array on error to prevent UI issues
      setAssets([]);
    }
  };

  useEffect(() => {
    console.log('🚀 ManagementAssets component mounted');
    console.log('🔧 Assets hook available:', { getUserAssets, getPublicAssets, uploadAsset, getAsset });
    checkAndSetupAuthorization();
    fetchAssets();
  }, []);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log('📁 Starting upload for file:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    // Ensure user is authorized before upload
    await checkAndSetupAuthorization();
    
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => (p < 90 ? p + 10 : p));
    }, 200);
    try {
      console.log('⬆️ Calling uploadAsset...');
      const result = await uploadAsset(file, true, []);
      console.log('✅ Upload result:', result);
      
      setUploadProgress(100);
      console.log('🔄 Refreshing assets after upload...');
      await fetchAssets();
    } catch (err) {
      console.error('❌ Upload error:', err);
    } finally {
      clearInterval(interval);
      setTimeout(() => setUploadProgress(0), 500);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (id: bigint) => {
    try {
      const asset = await getAsset(id);
      const blob = new Blob([new Uint8Array(asset.data)], {
        type: asset.contentType,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = asset.name;
      link.click();
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 font-mono">ASSETS</h2>
          <p className="text-gray-400">
            Manage digital assets and files for {dao.name}
          </p>
        </div>
        <div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all font-semibold"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Asset</span>
          </motion.button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          {uploadProgress > 0 && (
            <div className="mt-2 h-2 w-full bg-gray-700 rounded">
              <div
                className="h-full bg-green-500 rounded"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>


      {assets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 text-center"
        >
          <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2 font-mono">
            NO ASSETS AVAILABLE
          </h3>
          <p className="text-gray-400 mb-6">
            Upload files to start building your asset library.
          </p>
        </motion.div>
      ) : (
        <motion.ul
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {assets.map((asset: any) => (
            <li
              key={Number(asset.id)}
              className="flex justify-between items-center bg-gray-800/50 border border-gray-700/50 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3">
                <File className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-white font-mono">{asset.name}</p>
                  {asset.tags && asset.tags.length > 0 && (
                    <p className="text-gray-400 text-sm">
                      {asset.tags.join(', ')}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDownload(asset.id)}
                className="text-green-400 hover:text-green-300"
              >
                <Download className="w-5 h-5" />
              </button>
            </li>
          ))}
        </motion.ul>
      )}

    </div>
  );
};

export default ManagementAssets;

